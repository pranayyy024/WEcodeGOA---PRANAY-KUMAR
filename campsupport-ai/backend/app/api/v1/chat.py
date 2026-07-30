from fastapi import APIRouter

router = APIRouter()

@router.get("/chat")
def chat_health():
    return {"message": "Chat endpoint placeholder"}
