from pathlib import Path
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, status
from app.core.config import settings

router = APIRouter(tags=["Knowledge Base Documents"])


@router.get("/", status_code=status.HTTP_200_OK)
async def list_approved_documents() -> List[Dict[str, Any]]:
    """Lists all approved campus documents currently indexed in the RAG knowledge base."""
    docs_dir = Path(settings.APPROVED_DOCS_PATH)
    if not docs_dir.exists():
        return []

    documents = []
    for file_path in docs_dir.glob("*"):
        if file_path.is_file():
            documents.append({
                "filename": file_path.name,
                "size_bytes": file_path.stat().st_size,
                "extension": file_path.suffix,
                "status": "INDEXED"
            })
    return documents
