from fastapi import APIRouter, HTTPException, status
from typing import List
from app.models import (
    Draft, DraftInternal, GenerateReplyRequest, 
    SaveDraftRequest, SuccessResponse
)
from app.services import file_service, llm_service, vector_service
import uuid

router = APIRouter()


@router.get("/", response_model=List[Draft])
async def get_drafts():
    """
    Get all drafts with computed human-readable lastSaved dates
    
    Returns:
        List of drafts with 'lastSaved' field computed from 'timestamp'
    """
    try:
        drafts = file_service.read_drafts()
        return drafts
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to read drafts: {str(e)}"
        )


@router.post("/generate", response_model=dict)
async def generate_reply(request: GenerateReplyRequest):
    """
    Generate an AI reply for a specific email
    
    Does NOT save the draft - just returns the generated text
    Frontend can then edit and save it using POST /drafts
    
    Args:
        emailId: ID of the email to reply to
        
    Returns:
        {"content": "Generated reply text..."}
    """
    try:
        # Get the email
        email = file_service.get_email_by_id(request.emailId)
        if not email:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Email with id '{request.emailId}' not found"
            )
        
        # Get current prompts
        prompts = file_service.read_prompts()
        
        # Generate reply using LLM
        reply_content = llm_service.generate_reply(
            sender=email.sender,
            subject=email.subject,
            email_body=email.body,
            reply_prompt=prompts.reply
        )
        
        return {"content": reply_content}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate reply: {str(e)}"
        )


@router.post("/", response_model=Draft)
async def save_draft(request: SaveDraftRequest):
    """
    Create or update a draft (Upsert operation)
    
    If draft.id is provided and exists: UPDATE
    If draft.id is None or doesn't exist: CREATE with new UUID
    
    Args:
        Draft object with emailReferenceId, emailSubject, content
        
    Returns:
        Saved draft with updated lastSaved timestamp
    """
    try:
        # Generate ID if not provided
        draft_id = request.id if request.id else str(uuid.uuid4())
        
        # Create internal draft with current timestamp
        draft_internal = DraftInternal(
            id=draft_id,
            emailReferenceId=request.emailReferenceId,
            emailSubject=request.emailSubject,
            content=request.content,
            timestamp=file_service.generate_current_timestamp()
        )
        
        # Upsert (create or update)
        saved_draft = file_service.upsert_draft(draft_internal)
        
        # Convert to API format with computed lastSaved
        draft_api = Draft(
            id=saved_draft.id,
            emailReferenceId=saved_draft.emailReferenceId,
            emailSubject=saved_draft.emailSubject,
            content=saved_draft.content,
            timestamp=saved_draft.timestamp,
            lastSaved=file_service.format_relative_date(saved_draft.timestamp)
        )
        
        return draft_api
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save draft: {str(e)}"
        )


@router.delete("/{draft_id}", response_model=SuccessResponse)
async def delete_draft(draft_id: str):
    """
    Delete a draft by ID
    """
    try:
        # Read current drafts
        drafts_data = file_service._read_json(file_service.drafts_path)
        
        # Find and remove draft
        original_count = len(drafts_data)
        drafts_data = [d for d in drafts_data if d.get('id') != draft_id]
        
        if len(drafts_data) == original_count:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Draft with id '{draft_id}' not found"
            )
        
        # Save updated list
        file_service._write_json(file_service.drafts_path, drafts_data)
        
        return SuccessResponse(message=f"Draft {draft_id} deleted successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete draft: {str(e)}"
        )