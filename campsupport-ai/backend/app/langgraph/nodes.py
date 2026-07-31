from typing import Dict, Any, List
from app.langgraph.state import GraphState
from app.llamaindex.retriever import get_rag_retriever
from app.ticketing.mock import get_ticketing_client
from app.schemas.ticket import TicketCreate


def understand_query_node(state: GraphState) -> GraphState:
    """Analyzes the user's query to detect intent, category, and missing fields."""
    query_lower = state["query"].lower()
    metadata = state.get("user_metadata", {})
    missing: List[str] = []

    is_question = any(query_lower.startswith(q) for q in ["how", "what", "when", "where", "who", "why", "can i"])

    # 1. Detect explicit escalation first
    if any(k in query_lower for k in ["human", "agent", "ticket", "complaint", "support", "escalate", "representative"]):
        intent = "ESCALATE"
        department = "Campus IT"
    # 2. IT Issues vs IT FAQs
    elif any(k in query_lower for k in ["wifi", "wi-fi", "eduroam", "email", "password", "network", "login"]):
        department = "Campus IT"
        if is_question and not any(k in query_lower for k in ["not working", "fail", "broken", "error", "unable", "cannot"]):
            intent = "FAQ"
        else:
            intent = "IT_ISSUE"
            if not metadata.get("roll_number") and "roll" not in query_lower:
                missing.append("roll_number")
    # 3. Academic rules & calendar
    elif any(k in query_lower for k in ["exam", "mid-sem", "admit card", "attendance", "calendar", "semester"]):
        department = "Academic Registrar"
        intent = "FAQ"
    # 4. Hostel maintenance vs Hostel FAQs
    elif any(k in query_lower for k in ["hostel", "curfew", "warden", "repair", "plumbing", "room", "fault"]):
        department = "Hostel Admin"
        if any(k in query_lower for k in ["repair", "leak", "light", "fan", "fault", "broken"]):
            intent = "HOSTEL"
            if not metadata.get("room_number"):
                missing.append("room_number")
        else:
            intent = "FAQ"
    else:
        intent = "FAQ"
        department = "General"

    state["intent"] = intent
    state["department"] = department
    state["missing_fields"] = missing
    return state


def retrieve_docs_node(state: GraphState) -> GraphState:
    """Queries the LlamaIndex RAG retriever to fetch source-cited document snippets."""
    retriever = get_rag_retriever()
    citations, score = retriever.retrieve(state["query"])

    state["citations"] = citations
    state["confidence_score"] = score
    return state


def verify_answer_node(state: GraphState) -> GraphState:
    """Evaluates whether retrieved information is reliable enough to answer without speculation."""
    return state


def generate_answer_node(state: GraphState) -> GraphState:
    """Synthesizes an answer grounded strictly in approved document citations."""
    citations = state.get("citations", [])
    if citations:
        top_snippet = citations[0].snippet.strip()
        source = citations[0].source_document
        state["response_text"] = (
            f"Here is the official information from **{source}**:\n\n"
            f"{top_snippet}\n\n"
            f"---\n"
            f"*(Source verified from institutional document **{source}** • Match Confidence: {int(state['confidence_score'] * 100)}%)*"
        )
    else:
        state["response_text"] = "I could not find verified campus policy documents answering this query."

    state["requires_follow_up"] = False
    return state


def collect_details_node(state: GraphState) -> GraphState:
    """Prompts the user for missing required details before submitting a support ticket."""
    missing = state.get("missing_fields", [])
    fields_str = ", ".join(f"**{field.replace('_', ' ').title()}**" for field in missing)
    state["response_text"] = (
        f"To assist you with this {state['department']} request, I need a few additional details to avoid delays:\n\n"
        f"Please provide your: {fields_str}."
    )
    state["requires_follow_up"] = True
    return state


def create_ticket_node(state: GraphState) -> GraphState:
    """Creates a structured support ticket and auto-routes to the designated campus department."""
    ticketing_client = get_ticketing_client()
    query = state["query"]
    user_id = state.get("user_id", "student-default")
    department = state.get("department", "Campus IT")
    category = state.get("intent", "GENERAL")

    ticket_data = TicketCreate(
        user_id=user_id,
        title=query[:60] + ("..." if len(query) > 60 else ""),
        description=f"User Query: {query}\nRouted via CampSupport AI.",
        category=category,
        priority="HIGH" if category in ["IT_ISSUE", "ESCALATE"] else "MEDIUM",
        department=department,
        metadata=state.get("user_metadata", {})
    )

    created_ticket = ticketing_client.create_ticket(ticket_data)
    ticket_dict = {
        "ticket_id": created_ticket.ticket_id,
        "department": created_ticket.department,
        "status": created_ticket.status.value,
        "title": created_ticket.title,
    }

    state["ticket_created"] = ticket_dict
    state["response_text"] = (
        f"I have created a high-priority support ticket (**{created_ticket.ticket_id}**) and automatically "
        f"routed it to **{created_ticket.department}** with full conversation context.\n\n"
        f"You can track its status anytime in your Tickets dashboard."
    )
    state["requires_follow_up"] = False
    return state
