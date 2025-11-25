from fastapi import APIRouter, HTTPException, status
from app.models import ChatQueryRequest, ChatQueryResponse
from app.services import file_service, llm_service, vector_service
from app.models import (
    Draft, DraftInternal, GenerateReplyRequest, 
    SaveDraftRequest, SuccessResponse, EmailInternal
)
router = APIRouter()


@router.post("/query", response_model=ChatQueryResponse)
async def query_chat(request: ChatQueryRequest):
    """
    Ask a question about your emails using RAG (Retrieval-Augmented Generation)
    
    Process:
    1. Convert question to embedding
    2. Search Pinecone for most relevant emails
    3. Pass question + relevant emails to LLM
    4. Return AI-generated answer
    
    Examples:
    - "What tasks are due this week?"
    - "Any urgent emails?"
    - "Summarize my conversations with Sarah"
    - "What meetings do I have scheduled?"
    
    Args:
        query: User's question
        
    Returns:
        AI answer with optional source email IDs
    """
    try:
        # Get current prompts
        prompts = file_service.read_prompts()
        
        # Search for relevant emails using vector similarity
        relevant_emails = vector_service.search_relevant_emails(request.query)
        
        if not relevant_emails:
            return ChatQueryResponse(
                answer="I couldn't find any relevant emails to answer your question. Try asking about specific topics, people, or tasks mentioned in your inbox.",
                sources=[]
            )
        
        # Generate answer using LLM with context
        answer = llm_service.answer_with_context(
            question=request.query,
            context_emails=relevant_emails,
            rag_prompt=prompts.rag
        )
        
        # Extract source IDs
        source_ids = [email['id'] for email in relevant_emails]
        
        return ChatQueryResponse(
            answer=answer,
            sources=source_ids
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process chat query: {str(e)}"
        )


@router.post("/rebuild-index", response_model=SuccessResponse)
async def rebuild_index():
    """
    Rebuild the vector index from scratch
    
    Useful for:
    - Fixing corrupted index
    - Resetting demo state
    - After bulk email changes
    
    This will:
    1. Delete all vectors from Pinecone
    2. Re-embed all emails
    3. Re-upload to Pinecone
    """
    try:
        # Read all emails
        emails_data = file_service._read_json(file_service.inbox_path)
        emails_internal = [EmailInternal(**e) for e in emails_data]
        
        # Rebuild index
        vector_service.rebuild_index(emails_internal)
        
        return SuccessResponse(
            message=f"Successfully rebuilt index with {len(emails_internal)} emails"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to rebuild index: {str(e)}"
        )