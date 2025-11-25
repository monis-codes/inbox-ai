from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# ==================== Tag Model ====================
class Tag(BaseModel):
    """Email tag with label and Tailwind color class"""
    label: str = Field(..., description="Tag label (e.g., 'Urgent', 'To-Do')")
    color: str = Field(..., description="Tailwind CSS classes (e.g., 'bg-red-100 text-red-700')")

# ==================== Email Models ====================
class Email(BaseModel):
    """Email model matching frontend TypeScript interface"""
    id: str
    sender: str
    senderAvatar: str = Field(default="https://i.pravatar.cc/150?img=0")
    subject: str
    body: str
    timestamp: str = Field(..., description="ISO 8601 timestamp (e.g., '2024-01-15T10:30:00Z')")
    date: str = Field(default="", description="Human-readable date - computed on GET (e.g., 'Today, 10:30 AM')")
    tags: List[Tag] = Field(default_factory=list)
    read: bool = False
    preview: str = Field(..., description="First 50 characters of body")

class EmailUploadRequest(BaseModel):
    """Request model for uploading emails"""
    emails: List[dict]  # Accept raw JSON, we'll validate and transform

class EmailIngestResponse(BaseModel):
    """Response model for email ingestion"""
    status: str
    message: str
    processed_count: int
    total_count: int

# ==================== Draft Models ====================
class Draft(BaseModel):
    """Draft model matching frontend TypeScript interface"""
    id: str
    emailReferenceId: str = Field(..., description="ID of the email being replied to")
    emailSubject: str = Field(..., description="Subject of the original email")
    content: str
    timestamp: str = Field(..., description="ISO 8601 timestamp (e.g., '2024-01-15T11:20:00Z')")
    lastSaved: str = Field(default="", description="Human-readable timestamp - computed on GET (e.g., 'Today, 11:20 AM')")

class GenerateReplyRequest(BaseModel):
    """Request model for generating a reply"""
    emailId: str

class SaveDraftRequest(BaseModel):
    """Request model for saving/updating a draft"""
    id: Optional[str] = None  # None for new drafts
    emailReferenceId: str
    emailSubject: str
    content: str

# ==================== Prompts Models ====================
class Prompts(BaseModel):
    """AI prompts configuration matching frontend interface"""
    categorization: str = Field(..., description="Prompt for email categorization")
    reply: str = Field(..., description="Prompt for generating replies")
    rag: str = Field(..., description="System prompt for RAG chat agent")

# ==================== Chat Models ====================
class ChatQueryRequest(BaseModel):
    """Request model for chat queries"""
    query: str = Field(..., min_length=1, description="User's question")

class ChatQueryResponse(BaseModel):
    """Response model for chat queries"""
    answer: str
    sources: Optional[List[str]] = None  # Email IDs used as context

# ==================== Generic Response Models ====================
class SuccessResponse(BaseModel):
    """Generic success response"""
    status: str = "success"
    message: str

class ErrorResponse(BaseModel):
    """Generic error response"""
    status: str = "error"
    message: str
    detail: Optional[str] = None

# ==================== Helper Models (Internal Use) ====================
class EmailInternal(BaseModel):
    """Internal email model for storage (with ISO timestamps)"""
    id: str
    sender: str
    senderAvatar: str
    subject: str
    body: str
    timestamp: str  # ISO 8601 format
    tags: List[Tag] = Field(default_factory=list)
    read: bool = False
    preview: str

class DraftInternal(BaseModel):
    """Internal draft model for storage (with ISO timestamps)"""
    id: str
    emailReferenceId: str
    emailSubject: str
    content: str
    timestamp: str  # ISO 8601 format