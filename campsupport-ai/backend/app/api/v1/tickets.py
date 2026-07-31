import uuid
from typing import List, Optional
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, status, Query

from app.schemas.ticket import TicketCreate, TicketResponse, TicketStatus
from app.db.mongodb import get_ticket_store

router = APIRouter(tags=["Support Tickets"])

# ─── Seed demo tickets into the store on first import ───────────────────────

def _seed_demo_tickets(store):
    demo = [
        {
            "ticket_id": "TKT-2024-001",
            "user_id": "stud-1001",
            "title": "WiFi Connection Issue in Hostel Block B",
            "description": "Unable to connect to campus WiFi (PCCE-Student) from hostel room. Disconnects repeatedly.",
            "category": "IT_INFRA",
            "priority": "HIGH",
            "department": "IT Support",
            "status": "OPEN",
            "created_at": "2026-07-31T07:30:00+00:00",
            "updated_at": "2026-07-31T07:30:00+00:00",
            "staff_reply": None,
        },
        {
            "ticket_id": "TKT-2024-002",
            "user_id": "stud-1001",
            "title": "Library Fee Receipt Verification",
            "description": "Paid library fine of ₹120 via UPI on July 29th. Still shows unpaid in ERP.",
            "category": "FINANCE",
            "priority": "MEDIUM",
            "department": "Finance & Accounts",
            "status": "IN_PROGRESS",
            "created_at": "2026-07-30T09:00:00+00:00",
            "updated_at": "2026-07-31T06:00:00+00:00",
            "staff_reply": "We have received your payment details and are verifying with accounts. Will update within 1 working day.",
        },
        {
            "ticket_id": "TKT-2024-003",
            "user_id": "stud-1001",
            "title": "ID Card Renewal Request",
            "description": "Student ID card damaged. Requesting replacement. Fee of ₹50 paid at admin counter.",
            "category": "ACADEMIC",
            "priority": "LOW",
            "department": "Academic Services",
            "status": "RESOLVED",
            "created_at": "2026-07-28T11:00:00+00:00",
            "updated_at": "2026-07-30T15:00:00+00:00",
            "staff_reply": "New ID card ready at Academic Services counter, Block A Room 101, 9 AM – 5 PM.",
        },
    ]
    for t in demo:
        existing = store.get_ticket(t["ticket_id"])
        if not existing:
            store.save_ticket(t)

_store = get_ticket_store()
_seed_demo_tickets(_store)


# ─── Helper: dict → TicketResponse ──────────────────────────────────────────

def _doc_to_response(doc: dict) -> TicketResponse:
    status_map = {
        "OPEN": TicketStatus.OPEN,
        "IN_PROGRESS": TicketStatus.IN_PROGRESS,
        "RESOLVED": TicketStatus.RESOLVED,
        "CLOSED": TicketStatus.CLOSED,
    }
    return TicketResponse(
        ticket_id=doc["ticket_id"],
        user_id=doc["user_id"],
        title=doc["title"],
        description=doc["description"],
        category=doc.get("category", "GENERAL"),
        priority=doc.get("priority", "MEDIUM"),
        department=doc.get("department", "General"),
        status=status_map.get(doc.get("status", "OPEN"), TicketStatus.OPEN),
        created_at=doc.get("created_at", datetime.now(timezone.utc).isoformat()),
        conversation_summary=doc.get("conversation_summary", []),
        staff_reply=doc.get("staff_reply"),
    )


# ─── Endpoints ──────────────────────────────────────────────────────────────

@router.post("/", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
async def create_ticket(ticket_data: TicketCreate) -> TicketResponse:
    """Creates a new campus support ticket and persists it to MongoDB Atlas."""
    store = get_ticket_store()
    ticket_id = f"TKT-{uuid.uuid4().hex[:8].upper()}"
    now = datetime.now(timezone.utc).isoformat()

    doc = {
        "ticket_id": ticket_id,
        "user_id": ticket_data.user_id,
        "title": ticket_data.title,
        "description": ticket_data.description,
        "category": ticket_data.category,
        "priority": ticket_data.priority,
        "department": ticket_data.department,
        "status": "OPEN",
        "created_at": now,
        "updated_at": now,
        "staff_reply": None,
        "conversation_summary": [f"Ticket created via CampSupport AI for {ticket_data.category}"],
        "metadata": ticket_data.metadata or {},
    }

    store.save_ticket(doc)
    return _doc_to_response(doc)


@router.get("/", response_model=List[TicketResponse], status_code=status.HTTP_200_OK)
async def list_tickets(
    user_id: Optional[str] = Query(None, description="Filter tickets by user ID")
) -> List[TicketResponse]:
    """Returns all support tickets from MongoDB Atlas, newest first."""
    store = get_ticket_store()
    docs = store.get_all_tickets(user_id=user_id)
    return [_doc_to_response(d) for d in docs]


@router.get("/{ticket_id}", response_model=TicketResponse, status_code=status.HTTP_200_OK)
async def get_ticket_detail(ticket_id: str) -> TicketResponse:
    """Returns details for a specific ticket by its ID."""
    store = get_ticket_store()
    doc = store.get_ticket(ticket_id)
    if not doc:
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found.")
    return _doc_to_response(doc)


@router.patch("/{ticket_id}/status", response_model=TicketResponse, status_code=status.HTTP_200_OK)
async def update_ticket_status(ticket_id: str, new_status: TicketStatus) -> TicketResponse:
    """Updates ticket status (OPEN → IN_PROGRESS → RESOLVED → CLOSED)."""
    store = get_ticket_store()
    success = store.update_ticket_status(ticket_id, new_status.value)
    if not success:
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found.")
    doc = store.get_ticket(ticket_id)
    return _doc_to_response(doc)
