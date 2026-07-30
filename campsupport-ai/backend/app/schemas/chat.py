from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class CitationSchema(BaseModel):
    """Represents a verified source citation from campus approved documents."""
    source_document: str = Field(..., description="Name of the approved campus document (e.g., SOP_WiFi.pdf)")
    snippet: str = Field(..., description="Excerpt from the document supporting the answer")
    relevance_score: float = Field(0.0, description="Similarity or confidence score of retrieval")
    page_number: Optional[int] = Field(None, description="Page number if applicable")


class ChatRequest(BaseModel):
    """User request payload sent to the chat helpdesk."""
    message: str = Field(..., description="The user's query or message")
    user_id: Optional[str] = Field("student-default", description="ID of the student/faculty user")
    conversation_id: Optional[str] = Field(None, description="Conversation session ID for follow-ups")
    user_metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Metadata such as roll number or department")


class ChatResponse(BaseModel):
    """Structured response from the CampSupport AI LangGraph workflow."""
    answer: str = Field(..., description="The generated response or follow-up question")
    citations: List[CitationSchema] = Field(default_factory=list, description="Source documents referenced in the answer")
    confidence_score: float = Field(1.0, description="Confidence in the accuracy of the answer")
    requires_follow_up: bool = Field(False, description="True if AI is prompting for missing required details")
    missing_fields: List[str] = Field(default_factory=list, description="List of required details missing (e.g. ['roll_number', 'department'])")
    ticket_created: Optional[Dict[str, Any]] = Field(None, description="Structured ticket information if an escalation occurred")
    department_routed: Optional[str] = Field(None, description="Campus department assigned to resolve the query")
