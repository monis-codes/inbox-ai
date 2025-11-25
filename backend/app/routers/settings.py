from fastapi import APIRouter, HTTPException, status
from app.models import Prompts, SuccessResponse
from app.services import file_service, llm_service, vector_service

router = APIRouter()


@router.get("/prompts", response_model=Prompts)
async def get_prompts():
    """
    Get current AI prompt configurations
    
    Returns prompts for:
    - categorization: How to tag emails
    - reply: How to generate responses
    - rag: How to answer questions using email context
    """
    try:
        prompts = file_service.read_prompts()
        return prompts
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to read prompts: {str(e)}"
        )


@router.put("/prompts", response_model=Prompts)
async def update_prompts(prompts: Prompts):
    """
    Update AI prompt configurations
    
    Changes take effect immediately:
    - Next email categorization will use new rules
    - Next reply generation will use new tone/style
    - Next chat query will use new system prompt
    
    Args:
        Prompts object with categorization, reply, and rag fields
        
    Returns:
        Updated prompts (same as input)
    """
    try:
        # Validate prompts aren't empty
        if not prompts.categorization.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Categorization prompt cannot be empty"
            )
        if not prompts.reply.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Reply prompt cannot be empty"
            )
        if not prompts.rag.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="RAG prompt cannot be empty"
            )
        
        # Save prompts
        file_service.write_prompts(prompts)
        
        return prompts
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update prompts: {str(e)}"
        )


@router.post("/prompts/reset", response_model=Prompts)
async def reset_prompts():
    """
    Reset prompts to default values
    
    Useful if custom prompts aren't working well
    """
    try:
        default_prompts = Prompts(
            categorization="Categorize emails as: Urgent (requires immediate action), To-Do (actionable but not urgent), Newsletter (informational), or other. Consider tone, sender authority, and keywords. Return ONLY a JSON array of tag labels like [\"Urgent\", \"To-Do\"].",
            reply="Generate professional, concise replies that are slightly formal but friendly. Keep replies to 2-3 sentences. Match the tone of the original email.",
            rag="You are a helpful assistant with access to the user's email history. Answer questions about tasks, projects, and conversations based on the email content. Be concise and accurate. Only use information from the provided emails."
        )
        
        file_service.write_prompts(default_prompts)
        
        return default_prompts
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reset prompts: {str(e)}"
        )

