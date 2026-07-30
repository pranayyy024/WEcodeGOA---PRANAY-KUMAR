from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Query
from app.schemas.ticket import TicketCreate, TicketResponse, TicketStatus
from app.ticketing.mock import get_ticketing_client

router = APIRouter(tags=["Support Tickets"])


@router.post("/", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
async def create_ticket(ticket_data: TicketCreate) -> TicketResponse:
    """Manually creates a new campus support ticket and routes to department."""
    client = get_ticketing_client()
    return client.create_ticket(ticket_data)


@router.get("/", response_model=List[TicketResponse], status_code=status.HTTP_200_OK)
async def list_tickets(user_id: Optional[str] = Query(None, description="Filter tickets by user ID")) -> List[TicketResponse]:
    """Returns all active support tickets."""
    client = get_ticketing_client()
    return client.list_tickets(user_id=user_id)


@router.get("/{ticket_id}", response_model=TicketResponse, status_code=status.HTTP_200_OK)
async def get_ticket_detail(ticket_id: str) -> TicketResponse:
    """Returns details for a specific ticket by ID."""
    client = get_ticketing_client()
    ticket = client.get_ticket(ticket_id)
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket {ticket_id} not found"
        )
    return ticket


@router.patch("/{ticket_id}/status", response_model=TicketResponse, status_code=status.HTTP_200_OK)
async def update_ticket_status(ticket_id: str, new_status: TicketStatus) -> TicketResponse:
    """Updates ticket status (OPEN, IN_PROGRESS, RESOLVED, CLOSED)."""
    client = get_ticketing_client()
    ticket = client.update_status(ticket_id, new_status)
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket {ticket_id} not found"
        )
    return ticket
