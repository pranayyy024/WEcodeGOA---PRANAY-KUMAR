from typing import TypedDict, List, Optional, Dict, Any
from app.schemas.chat import CitationSchema


class GraphState(TypedDict):
    """LangGraph state passed between nodes during campus query processing."""
    query: str
    user_id: str
    conversation_id: Optional[str]
    user_metadata: Dict[str, Any]

    # Intent & routing analysis
    intent: str  # "FAQ", "IT_ISSUE", "ACADEMIC", "HOSTEL", "ESCALATE"
    department: str  # "Campus IT", "Academic Registrar", "Hostel Admin", "General"
    missing_fields: List[str]  # e.g., ["roll_number", "room_number"]

    # Retrieval results
    citations: List[CitationSchema]
    confidence_score: float

    # Final outputs
    response_text: str
    requires_follow_up: bool
    ticket_created: Optional[Dict[str, Any]]
