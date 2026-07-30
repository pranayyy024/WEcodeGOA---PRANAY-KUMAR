from fastapi import APIRouter

router = APIRouter()

@router.post("/docs")
def ingest_docs():
    return {"message": "Docs ingestion placeholder"}
