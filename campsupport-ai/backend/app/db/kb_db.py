import sqlite3
import os
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from app.db.auth_db import ADMINS_DB_PATH, DATA_DIR

DOCS_DIR = os.path.join(os.path.dirname(DATA_DIR), "data", "approved_docs")


def init_kb_database():
    """Initializes the knowledge_base SQLite table inside admins.db and seeds with approved_docs files."""
    with sqlite3.connect(ADMINS_DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS knowledge_base (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                college_id TEXT NOT NULL,
                department TEXT NOT NULL,
                category TEXT NOT NULL,
                size TEXT NOT NULL,
                chunks INTEGER NOT NULL,
                last_updated TEXT NOT NULL,
                status TEXT NOT NULL
            )
        """)
        cursor.execute("SELECT COUNT(*) FROM knowledge_base")
        if cursor.fetchone()[0] == 0:
            # Seed from physical files in approved_docs directory
            if os.path.exists(DOCS_DIR):
                files = sorted(os.listdir(DOCS_DIR))
                idx = 1
                for fname in files:
                    if fname.startswith(".") or fname == "README_dataset_index.json":
                        continue
                    fpath = os.path.join(DOCS_DIR, fname)
                    if not os.path.isfile(fpath):
                        continue
                    
                    size_kb = max(1.0, round(os.path.getsize(fpath) / 1024, 1))
                    chunks = max(4, int(size_kb * 8))
                    
                    # Deduce Department & Category from filename
                    lower = fname.lower()
                    if "wifi" in lower or "network" in lower or "it" in lower:
                        dept = "IT Support"
                        cat = "Technical"
                    elif "fee" in lower or "payment" in lower or "aid" in lower or "scheme" in lower:
                        dept = "Finance & Accounts"
                        cat = "Financial"
                    elif "academic" in lower or "syllabus" in lower or "timetable" in lower or "grading" in lower:
                        dept = "Academic Services"
                        cat = "Academic"
                    elif "rules" in lower or "policy" in lower or "hostel" in lower:
                        dept = "Student Services"
                        cat = "Policies"
                    else:
                        dept = "Campus Support"
                        cat = "General"
                        
                    doc_id = f"gec-doc-{idx}"
                    last_updated = "2026-07-31 (Verified)"
                    status = "INDEXED"
                    
                    cursor.execute("""
                        INSERT INTO knowledge_base (id, name, college_id, department, category, size, chunks, last_updated, status)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (doc_id, fname, "GEC", dept, cat, f"{size_kb} KB", chunks, last_updated, status))
                    idx += 1
        conn.commit()


def get_all_kb_documents(college_id: str = "GEC") -> List[Dict[str, Any]]:
    """Returns all knowledge base documents for the given college tenant from SQLite."""
    init_kb_database()
    with sqlite3.connect(ADMINS_DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM knowledge_base WHERE college_id = ? ORDER BY name ASC", (college_id,))
        rows = cursor.fetchall()
        return [dict(row) for row in rows]


def insert_kb_document(doc_data: Dict[str, Any]) -> Dict[str, Any]:
    """Inserts a new document record into knowledge_base SQLite table."""
    init_kb_database()
    with sqlite3.connect(ADMINS_DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO knowledge_base (id, name, college_id, department, category, size, chunks, last_updated, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            doc_data["id"],
            doc_data["name"],
            doc_data["college_id"],
            doc_data["department"],
            doc_data.get("category", "Technical"),
            doc_data["size"],
            doc_data["chunks"],
            doc_data["last_updated"],
            doc_data["status"]
        ))
        conn.commit()
    return doc_data


def delete_kb_document_by_id(doc_id: str, college_id: str = "GEC") -> Optional[Dict[str, Any]]:
    """Deletes a document from knowledge_base SQLite table and returns the deleted record if found."""
    init_kb_database()
    with sqlite3.connect(ADMINS_DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM knowledge_base WHERE id = ? AND college_id = ?", (doc_id, college_id))
        row = cursor.fetchone()
        if not row:
            return None
        cursor.execute("DELETE FROM knowledge_base WHERE id = ? AND college_id = ?", (doc_id, college_id))
        conn.commit()
        return dict(row)
