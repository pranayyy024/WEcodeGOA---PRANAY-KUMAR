from fastapi import APIRouter

router = APIRouter()

@router.get("/tickets")
def list_tickets():
    return {"tickets": []}
