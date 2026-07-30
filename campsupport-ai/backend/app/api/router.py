from fastapi import APIRouter
from app.api.v1.chat import router as chat_router
from app.api.v1.tickets import router as tickets_router
from app.api.v1.docs import router as docs_router

api_router = APIRouter()

api_router.include_router(chat_router, prefix="/chat")
api_router.include_router(tickets_router, prefix="/tickets")
api_router.include_router(docs_router, prefix="/docs")
