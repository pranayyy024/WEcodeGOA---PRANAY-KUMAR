import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from app.schemas.ticket import TicketCreate, TicketResponse, TicketStatus


class MockTicketingClient:
    """In-memory Mock Ticketing client simulating Zendesk / ServiceNow for hackathon & prototype testing."""

    def __init__(self):
        self._tickets: Dict[str, TicketResponse] = {}
        self._seed_default_tickets()

    def _seed_default_tickets(self):
        """Seeds default sample tickets for demo purposes."""
        demo_ticket = TicketResponse(
            ticket_id="#TICK-1001",
            user_id="student-demo",
            title="Wi-Fi 802.1x authentication failure in Block B",
            description="Student unable to connect to EduRoam/Campus-WiFi using credentials.",
            category="IT_INFRA",
            priority="HIGH",
            department="Campus IT",
            status=TicketStatus.IN_PROGRESS,
            created_at=datetime.now(timezone.utc).isoformat(),
            conversation_summary=["User reported wifi failure in Block B", "Escalated to network team"]
        )
        self._tickets["#TICK-1001"] = demo_ticket

    def create_ticket(self, ticket_data: TicketCreate) -> TicketResponse:
        """Creates a new support ticket and routes it to the designated department."""
        ticket_id = f"#TICK-{1000 + len(self._tickets) + 1}"
        response = TicketResponse(
            ticket_id=ticket_id,
            user_id=ticket_data.user_id,
            title=ticket_data.title,
            description=ticket_data.description,
            category=ticket_data.category,
            priority=ticket_data.priority,
            department=ticket_data.department,
            status=TicketStatus.OPEN,
            created_at=datetime.now(timezone.utc).isoformat(),
            conversation_summary=[f"Ticket created for {ticket_data.category}"]
        )
        self._tickets[ticket_id] = response
        return response

    def get_ticket(self, ticket_id: str) -> Optional[TicketResponse]:
        """Retrieves ticket details by ID."""
        return self._tickets.get(ticket_id)

    def list_tickets(self, user_id: Optional[str] = None) -> List[TicketResponse]:
        """Lists all tickets, optionally filtered by user ID."""
        if user_id:
            return [t for t in self._tickets.values() if t.user_id == user_id]
        return list(self._tickets.values())

    def update_status(self, ticket_id: str, new_status: TicketStatus) -> Optional[TicketResponse]:
        """Updates ticket resolution status."""
        ticket = self._tickets.get(ticket_id)
        if ticket:
            ticket.status = new_status
        return ticket


# Singleton mock instance for application lifecycle
_mock_client_instance = MockTicketingClient()


def get_ticketing_client() -> MockTicketingClient:
    """Factory method to get active ticketing provider."""
    return _mock_client_instance
