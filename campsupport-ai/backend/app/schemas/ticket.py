from typing import Optional, Dict, Any, List
from enum import Enum
from pydantic import BaseModel, Field
from datetime import datetime, timezone


class TicketStatus(str, Enum):
    OPEN = "OPEN"
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"


class TicketCreate(BaseModel):
    """Schema for creating a campus support ticket."""
    user_id: str = Field(..., description="ID of the submitter")
    title: str = Field(..., description="Summary title of the issue")
    description: str = Field(..., description="Full context and conversation summary")
    category: str = Field("GENERAL", description="Category: IT_INFRA, ACADEMIC, HOSTEL, PAYROLL")
    priority: str = Field("MEDIUM", description="Priority level: LOW, MEDIUM, HIGH, URGENT")
    department: str = Field("Campus IT", description="Assigned campus department")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional student or form details")


class TicketResponse(BaseModel):
    """Schema representing an existing ticket."""
    ticket_id: str = Field(..., description="Unique ticket identifier (e.g. #TICK-1042)")
    user_id: str
    title: str
    description: str
    category: str
    priority: str
    department: str
    status: TicketStatus = TicketStatus.OPEN
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    conversation_summary: Optional[List[str]] = Field(default_factory=list)
