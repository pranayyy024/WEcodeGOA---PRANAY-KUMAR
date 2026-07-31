import os
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status, Query, UploadFile, File, Form
from pydantic import BaseModel

router = APIRouter(tags=["Knowledge Base & Multi-College Documents"])


class KBDocumentResponse(BaseModel):
    id: str
    name: str
    college_id: str
    department: str
    size: str
    chunks: int
    last_updated: str
    status: str


# In-memory mock multi-college knowledge base registry for hackathon demo
_MULTI_COLLEGE_KB: Dict[str, List[Dict[str, Any]]] = {
    "GEC": [
        {
            "id": "gec-doc-1",
            "name": "wifi_email_sop.txt",
            "college_id": "GEC",
            "department": "Campus IT",
            "size": "1.4 KB",
            "chunks": 12,
            "last_updated": "2026-07-30 (Verified)",
            "status": "INDEXED",
        },
        {
            "id": "gec-doc-2",
            "name": "academic_calendar_2026.txt",
            "college_id": "GEC",
            "department": "Academic Registrar",
            "size": "2.1 KB",
            "chunks": 18,
            "last_updated": "2026-07-30 (Verified)",
            "status": "INDEXED",
        },
        {
            "id": "gec-doc-3",
            "name": "hostel_policy.txt",
            "college_id": "GEC",
            "department": "Hostel Admin",
            "size": "1.8 KB",
            "chunks": 14,
            "last_updated": "2026-07-30 (Verified)",
            "status": "INDEXED",
        },
    ],
    "BITS_PILANI": [
        {
            "id": "bits-doc-1",
            "name": "bits_wifi_eduroam_rules.txt",
            "college_id": "BITS_PILANI",
            "department": "Campus IT",
            "size": "1.9 KB",
            "chunks": 15,
            "last_updated": "2026-07-30 (Verified)",
            "status": "INDEXED",
        },
        {
            "id": "bits-doc-2",
            "name": "bits_library_fine_sop.txt",
            "college_id": "BITS_PILANI",
            "department": "Library Admin",
            "size": "1.2 KB",
            "chunks": 9,
            "last_updated": "2026-07-30 (Verified)",
            "status": "INDEXED",
        },
    ],
    "IIT_BOMBAY": [
        {
            "id": "iitb-doc-1",
            "name": "iitb_hostel_curfew_rules.txt",
            "college_id": "IIT_BOMBAY",
            "department": "Hostel Admin",
            "size": "2.5 KB",
            "chunks": 21,
            "last_updated": "2026-07-30 (Verified)",
            "status": "INDEXED",
        },
    ],
}


from app.db.kb_db import get_all_kb_documents, insert_kb_document, delete_kb_document_by_id, DOCS_DIR
from app.llamaindex.retriever import reload_rag_retriever


@router.get("/documents", response_model=List[KBDocumentResponse])
async def list_kb_documents(
    college_id: str = Query("GEC", description="College tenant identifier")
) -> List[KBDocumentResponse]:
    """Returns all approved policy documents indexed in SQLite for a specific college."""
    docs = get_all_kb_documents(college_id)
    return [
        KBDocumentResponse(
            id=d["id"],
            name=d["name"],
            college_id=d["college_id"],
            department=d["department"],
            size=d["size"],
            chunks=int(d["chunks"]),
            last_updated=d["last_updated"],
            status=d["status"]
        )
        for d in docs
    ]


@router.post("/upload", response_model=KBDocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_kb_document(
    file: UploadFile = File(...),
    college_id: str = Form("GEC"),
    department: str = Form("Campus IT"),
    category: str = Form("Technical"),
) -> KBDocumentResponse:
    """Uploads a new policy document (.txt/.md/.json) to disk, saves metadata in SQLite, and re-indexes AI RAG retriever."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename cannot be empty")

    content = await file.read()
    size_kb = max(1.0, round(len(content) / 1024, 1))
    chunk_count = max(4, len(content) // 250)

    # 1. Save physical file to data/approved_docs/
    os.makedirs(DOCS_DIR, exist_ok=True)
    target_path = os.path.join(DOCS_DIR, file.filename)
    with open(target_path, "wb") as f:
        f.write(content)

    # 2. Save metadata in admins.db
    doc_id = f"gec-doc-{int(datetime.now(timezone.utc).timestamp())}"
    new_doc = {
        "id": doc_id,
        "name": file.filename,
        "college_id": college_id,
        "department": department,
        "category": category,
        "size": f"{size_kb} KB",
        "chunks": chunk_count,
        "last_updated": datetime.now(timezone.utc).strftime("%Y-%m-%d (Uploaded by Admin)"),
        "status": "INDEXED",
    }
    insert_kb_document(new_doc)

    # 3. Trigger automatic AI Chatbot RAG Re-indexing!
    try:
        reload_rag_retriever()
    except Exception as e:
        print(f"Warning: RAG re-indexing error: {e}")

    return KBDocumentResponse(**new_doc)


@router.delete("/documents/{doc_id}", status_code=status.HTTP_200_OK)
async def delete_kb_document(
    doc_id: str,
    college_id: str = Query("GEC")
) -> Dict[str, str]:
    """Deletes a policy document from the college Knowledge Base SQLite database and re-indexes AI RAG."""
    deleted = delete_kb_document_by_id(doc_id, college_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Document {doc_id} not found in {college_id}")

    # Remove physical file if it exists in DOCS_DIR
    fname = deleted.get("name", "")
    if fname:
        fpath = os.path.join(DOCS_DIR, fname)
        if os.path.exists(fpath):
            try:
                os.remove(fpath)
            except Exception:
                pass

    # Trigger automatic AI Chatbot RAG Re-indexing!
    try:
        reload_rag_retriever()
    except Exception as e:
        print(f"Warning: RAG re-indexing error on delete: {e}")

    return {"message": f"Successfully deleted document {doc_id} from {college_id} Knowledge Base"}
