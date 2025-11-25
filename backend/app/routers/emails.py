
from fastapi import APIRouter, HTTPException, UploadFile, File, status
from typing import List
import json
from app.models import (
    Email, EmailInternal, EmailUploadRequest, 
    EmailIngestResponse, SuccessResponse, Tag
)
from app.services import file_service, llm_service, vector_service

router = APIRouter()


@router.get("/", response_model=List[Email])
async def get_emails():
    """
    Get all emails with computed human-readable dates
    
    Returns:
        List of emails with 'date' field computed from 'timestamp'
    """
    try:
        emails = file_service.read_emails()
        return emails
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to read emails: {str(e)}"
        )


@router.post("/upload", response_model=SuccessResponse)
async def upload_emails(file: UploadFile = File(...)):
    """
    Upload a JSON file containing emails
    
    Expected JSON format:
    [
      {
        "id": "1",
        "sender": "John Doe",
        "subject": "Meeting",
        "body": "Let's meet tomorrow...",
        "timestamp": "2024-11-24T10:30:00Z"
      }
    ]
    
    Optional fields (will be auto-generated):
    - senderAvatar (generated from sender name)
    - date (computed from timestamp)
    - preview (first 50 chars of body)
    - read (defaults to false)
    - tags (defaults to empty array)
    """
    try:
        # Read file content
        content = await file.read()
        emails_data = json.loads(content)
        
        if not isinstance(emails_data, list):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="JSON must be an array of email objects"
            )
        
        # Transform and validate each email
        processed_emails = []
        for i, email_dict in enumerate(emails_data):
            try:
                # Add missing fields
                if "senderAvatar" not in email_dict:
                    email_dict["senderAvatar"] = file_service.generate_avatar_url(
                        email_dict.get("sender", "Unknown")
                    )
                
                if "preview" not in email_dict:
                    email_dict["preview"] = file_service.create_preview(
                        email_dict.get("body", "")
                    )
                
                if "read" not in email_dict:
                    email_dict["read"] = False
                
                if "tags" not in email_dict:
                    email_dict["tags"] = []
                
                # Validate timestamp exists
                if "timestamp" not in email_dict:
                    raise ValueError("Missing 'timestamp' field")
                
                # Parse as EmailInternal model
                email = EmailInternal(**email_dict)
                processed_emails.append(email)
                
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid email at index {i}: {str(e)}"
                )
        
        # Save to inbox.json
        file_service.write_emails(processed_emails)
        
        return SuccessResponse(
            message=f"Successfully uploaded {len(processed_emails)} emails"
        )
        
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON file"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload emails: {str(e)}"
        )


@router.post("/ingest", response_model=EmailIngestResponse)
async def ingest_emails():
    """
    Categorize emails without tags and update vector index
    
    This endpoint:
    1. Reads all emails from inbox
    2. For each email with empty tags array:
       - Calls LLM to categorize
       - Adds Tag objects (with label and color)
    3. Saves updated emails
    4. Updates Pinecone vector index
    
    Returns count of processed emails
    """
    try:
        # Read current prompts
        prompts = file_service.read_prompts()
        
        # Read emails (internal format with ISO timestamps)
        emails_data = file_service._read_json(file_service.inbox_path)
        emails_internal = [EmailInternal(**e) for e in emails_data]
        
        processed_count = 0
        total_count = len(emails_internal)
        
        # Process emails without tags
        for email in emails_internal:
            if not email.tags or len(email.tags) == 0:
                # Categorize using LLM
                tags = llm_service.categorize_email(
                    email_body=email.body,
                    subject=email.subject,
                    categorization_prompt=prompts.categorization
                )
                
                # Update email with tags
                email.tags = tags
                processed_count += 1
        
        # Save updated emails
        file_service.write_emails(emails_internal)
        
        # Update vector index for RAG
        try:
            vector_service.upsert_emails(emails_internal)
        except Exception as e:
            print(f"Warning: Failed to update vector index: {e}")
            # Continue even if vector update fails
        
        return EmailIngestResponse(
            status="success",
            message=f"Processed {processed_count} out of {total_count} emails",
            processed_count=processed_count,
            total_count=total_count
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to ingest emails: {str(e)}"
        )


@router.delete("/{email_id}", response_model=SuccessResponse)
async def delete_email(email_id: str):
    """
    Delete an email by ID
    Also removes it from the vector index
    """
    try:
        # Read current emails
        emails_data = file_service._read_json(file_service.inbox_path)
        
        # Find and remove email
        original_count = len(emails_data)
        emails_data = [e for e in emails_data if e.get('id') != email_id]
        
        if len(emails_data) == original_count:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Email with id '{email_id}' not found"
            )
        
        # Save updated list
        file_service._write_json(file_service.inbox_path, emails_data)
        
        # Delete from vector index
        try:
            vector_service.index.delete(ids=[email_id])
        except Exception as e:
            print(f"Warning: Failed to delete from vector index: {e}")
        
        return SuccessResponse(message=f"Email {email_id} deleted successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete email: {str(e)}"
        )