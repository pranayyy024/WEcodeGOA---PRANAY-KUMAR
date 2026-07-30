from fastapi import APIRouter, HTTPException, status
from app.schemas.chat import ChatRequest, ChatResponse
from app.langgraph.workflow import run_campus_agent
from app.core.config import settings

router = APIRouter(tags=["Chat Helpdesk"])


@router.post("/", response_model=ChatResponse, status_code=status.HTTP_200_OK)
async def chat_endpoint(request: ChatRequest) -> ChatResponse:
    """Processes a campus helpdesk query through the LangGraph RAG + Escalation workflow."""
    try:
        response = run_campus_agent(
            query=request.message,
            user_id=request.user_id or "student-default",
            conversation_id=request.conversation_id,
            user_metadata=request.user_metadata or {}
        )
        return response
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing LangGraph workflow: {str(exc)}"
        )


@router.get("/config", status_code=status.HTTP_200_OK)
async def get_chat_config():
    """Returns active AI provider and RAG confidence threshold configuration."""
    return {
        "llm_provider": settings.LLM_PROVIDER,
        "rag_confidence_threshold": settings.RAG_CONFIDENCE_THRESHOLD,
        "ticketing_provider": settings.TICKETING_PROVIDER,
        "status": "ready"
    }
