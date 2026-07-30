from typing import Any, Dict, Literal
from app.core.config import settings
from app.schemas.chat import ChatResponse
from app.langgraph.state import GraphState
from app.langgraph.nodes import (
    understand_query_node,
    retrieve_docs_node,
    verify_answer_node,
    generate_answer_node,
    collect_details_node,
    create_ticket_node,
)

try:
    from langgraph.graph import StateGraph, END
    LANGGRAPH_AVAILABLE = True
except ImportError:
    LANGGRAPH_AVAILABLE = False


def route_decision(state: GraphState) -> Literal["generate_answer", "collect_details", "create_ticket"]:
    """Deterministic routing function based on confidence score and missing details."""
    intent = state.get("intent", "FAQ")
    missing = state.get("missing_fields", [])
    confidence = state.get("confidence_score", 0.0)

    # 1. Explicit escalation request or extremely low RAG confidence on an actionable issue
    if intent == "ESCALATE" or (confidence < settings.RAG_CONFIDENCE_THRESHOLD and intent in ["IT_ISSUE", "HOSTEL"]):
        if missing:
            return "collect_details"
        return "create_ticket"

    # 2. Missing required fields for a service request
    if missing and intent in ["IT_ISSUE", "HOSTEL"]:
        return "collect_details"

    # 3. If confidence is very low and no answer found, route to ticket creation
    if confidence < 0.35:
        return "create_ticket"

    # 4. Default: generate answer from approved campus docs
    return "generate_answer"


class CampusAgentWorkflow:
    """Manages LangGraph StateGraph compilation and execution."""

    def __init__(self):
        self.graph = self._build_graph()

    def _build_graph(self):
        if not LANGGRAPH_AVAILABLE:
            return None

        workflow = StateGraph(GraphState)

        # Add Nodes
        workflow.add_node("understand", understand_query_node)
        workflow.add_node("retrieve", retrieve_docs_node)
        workflow.add_node("verify", verify_answer_node)
        workflow.add_node("generate_answer", generate_answer_node)
        workflow.add_node("collect_details", collect_details_node)
        workflow.add_node("create_ticket", create_ticket_node)

        # Define Edges
        workflow.set_entry_point("understand")
        workflow.add_edge("understand", "retrieve")
        workflow.add_edge("retrieve", "verify")

        # Conditional Edge after verify
        workflow.add_conditional_edges(
            "verify",
            route_decision,
            {
                "generate_answer": "generate_answer",
                "collect_details": "collect_details",
                "create_ticket": "create_ticket",
            },
        )

        workflow.add_edge("generate_answer", END)
        workflow.add_edge("collect_details", END)
        workflow.add_edge("create_ticket", END)

        return workflow.compile()

    def invoke(self, query: str, user_id: str = "student-default", conversation_id: str = None, user_metadata: Dict[str, Any] = None) -> ChatResponse:
        """Executes the workflow graph and returns a structured ChatResponse."""
        initial_state: GraphState = {
            "query": query,
            "user_id": user_id,
            "conversation_id": conversation_id,
            "user_metadata": user_metadata or {},
            "intent": "FAQ",
            "department": "General",
            "missing_fields": [],
            "citations": [],
            "confidence_score": 0.0,
            "response_text": "",
            "requires_follow_up": False,
            "ticket_created": None,
        }

        if self.graph:
            final_state = self.graph.invoke(initial_state)
        else:
            # Fallback execution if langgraph is not installed
            st = understand_query_node(initial_state)
            st = retrieve_docs_node(st)
            decision = route_decision(st)
            if decision == "collect_details":
                final_state = collect_details_node(st)
            elif decision == "create_ticket":
                final_state = create_ticket_node(st)
            else:
                final_state = generate_answer_node(st)

        return ChatResponse(
            answer=final_state["response_text"],
            citations=final_state.get("citations", []),
            confidence_score=final_state.get("confidence_score", 1.0),
            requires_follow_up=final_state.get("requires_follow_up", False),
            missing_fields=final_state.get("missing_fields", []),
            ticket_created=final_state.get("ticket_created"),
            department_routed=final_state.get("department")
        )


_workflow_instance = CampusAgentWorkflow()


def get_campus_agent_graph() -> CampusAgentWorkflow:
    return _workflow_instance


def run_campus_agent(query: str, user_id: str = "student-default", conversation_id: str = None, user_metadata: Dict[str, Any] = None) -> ChatResponse:
    """Convenience helper to invoke the agent."""
    return get_campus_agent_graph().invoke(query=query, user_id=user_id, conversation_id=conversation_id, user_metadata=user_metadata)
