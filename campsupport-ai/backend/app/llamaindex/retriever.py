import os
import re
from pathlib import Path
from typing import List, Tuple, Dict, Any
from app.core.config import settings
from app.db.semantic_search import SemanticSearchProvider
from app.schemas.chat import CitationSchema

try:
    from llama_index.core import SimpleDirectoryReader, VectorStoreIndex, Document
    from llama_index.core.retrievers import VectorIndexRetriever
    LLAMA_INDEX_AVAILABLE = True
except ImportError:
    LLAMA_INDEX_AVAILABLE = False


class CampusRAGRetriever:
    """Retrieves source-cited information exclusively from approved campus documents.

    Supports both LlamaIndex VectorStore (OpenAI/Gemini) and an offline/mock fallback
    for instant local testing without API keys.
    """

    def __init__(self, docs_path: str = settings.APPROVED_DOCS_PATH):
        self.docs_path = Path(docs_path)
        self._documents: List[Dict[str, str]] = []
        self._semantic_provider = SemanticSearchProvider(provider_name="hybrid")
        self._load_local_docs()

    def _format_json_to_text(self, data: Any, prefix: str = "") -> str:
        """Recursively formats JSON structures into clean markdown paragraphs separated by \\n\\n."""
        import json
        if isinstance(data, dict):
            if "question" in data and "answer" in data:
                cat = data.get("category", "")
                cat_str = f"[Category: {cat}] " if cat else ""
                return f"{cat_str}Question: {data['question']}\nAnswer: {data['answer']}"
            blocks = []
            for k, v in data.items():
                title = k.replace("_", " ").title()
                if isinstance(v, (dict, list)):
                    sub = self._format_json_to_text(v, prefix=f"{title}: ")
                    if sub.strip():
                        blocks.append(sub)
                else:
                    blocks.append(f"{title}: {v}")
            return "\n\n".join(blocks)
        elif isinstance(data, list):
            blocks = []
            for item in data:
                sub = self._format_json_to_text(item)
                if sub.strip():
                    blocks.append(sub)
            return "\n\n".join(blocks)
        else:
            return f"{prefix}{data}"

    def _load_local_docs(self):
        """Loads all .txt, .md, and .json approved documents into memory."""
        import json
        search_paths = [
            self.docs_path,
            Path(__file__).resolve().parents[2] / "data" / "approved_docs",  # backend/data/approved_docs
            Path(__file__).resolve().parents[3] / "data" / "approved_docs",  # campsupport-ai/data/approved_docs
            Path.cwd() / "data" / "approved_docs",
            Path.cwd().parent / "data" / "approved_docs",
        ]

        valid_dir = None
        for path_option in search_paths:
            if path_option.exists() and path_option.is_dir():
                valid_dir = path_option
                break

        if not valid_dir:
            return

        for file_path in valid_dir.glob("*.*"):
            suffix = file_path.suffix.lower()
            if suffix not in [".txt", ".md", ".json"]:
                continue
            try:
                raw_text = file_path.read_text(encoding="utf-8")
                if suffix == ".json":
                    parsed_json = json.loads(raw_text)
                    content = self._format_json_to_text(parsed_json)
                else:
                    content = raw_text

                self._documents.append({
                    "source": file_path.name,
                    "content": content
                })
            except Exception as e:
                print(f"Error loading {file_path}: {e}")

    def retrieve(self, query: str, top_k: int = 3) -> Tuple[List[CitationSchema], float]:
        """Queries approved documents and returns source citations + highest confidence score.

        Returns:
            Tuple[List[CitationSchema], float]: (citations, max_confidence_score)
        """
        if not self._documents:
            return [], 0.0

        query_terms = [w.lower() for w in re.findall(r"[\w-]+", query) if len(w) >= 2]
        if not query_terms:
            return [], 0.0

        top_chunks = self._semantic_provider.search(query, self._documents, top_k=top_k)
        if not top_chunks:
            return [], 0.0

        if not top_chunks:
            return [], 0.0

        citations = [
            CitationSchema(
                source_document=source,
                snippet=snippet[:300] + ("..." if len(snippet) > 300 else ""),
                relevance_score=round(score, 2)
            )
            for score, source, snippet in top_chunks
        ]
        max_score = round(top_chunks[0][0], 2)
        return citations, max_score


# Singleton RAG retriever instance
_rag_retriever_instance = CampusRAGRetriever()


def get_rag_retriever() -> CampusRAGRetriever:
    return _rag_retriever_instance
