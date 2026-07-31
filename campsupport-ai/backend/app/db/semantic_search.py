import re
from typing import Any, Dict, List, Tuple


SEMANTIC_ALIAS_GROUPS: Dict[str, Tuple[str, ...]] = {
    "wifi": (
        "wifi",
        "wi-fi",
        "eduroam",
        "campusnet",
        "internet",
        "network",
        "connect",
        "authentication",
        "access",
    ),
    "attendance": (
        "attendance",
        "admit",
        "card",
        "exam",
        "semester",
        "calendar",
    ),
    "hostel": (
        "hostel",
        "curfew",
        "warden",
        "repair",
        "room",
        "maintenance",
        "fault",
    ),
}


class SemanticSearchProvider:
    """Semantic retriever abstraction for future database-backed vector search.

    Today it uses a deterministic alias-based semantic matcher so the project can
    be tested and exercised immediately, while preserving a clean provider seam
    for a later MongoDB/Atlas vector search implementation.
    """

    def __init__(self, provider_name: str = "hybrid"):
        self.provider_name = provider_name.lower()

    def search(self, query: str, documents: List[Dict[str, str]], top_k: int = 3) -> List[Tuple[float, str, str]]:
        """Return ranked semantic hits in the same shape used by the current retriever."""
        query_terms = [w.lower() for w in re.findall(r"[\w-]+", query) if len(w) >= 2]
        if not query_terms:
            return []

        scored_chunks: List[Tuple[float, str, str]] = []
        query_lower = query.lower()

        for doc in documents:
            source = doc["source"]
            content = doc["content"]
            sections = [s.strip() for s in content.split("\n\n") if len(s.strip()) > 20]

            for section in sections:
                section_lower = section.lower()
                semantic_hits = 0
                semantic_boost = 0.0

                for group_name, aliases in SEMANTIC_ALIAS_GROUPS.items():
                    group_hit = any(alias in section_lower for alias in aliases)
                    query_group_hit = any(alias in query_lower for alias in aliases)
                    if group_hit and query_group_hit:
                        semantic_hits += 1
                        semantic_boost += 0.18

                lexical_matches = sum(1 for term in query_terms if term in section_lower)
                if semantic_hits > 0 or lexical_matches > 0:
                    score = min(0.99, 0.25 + (lexical_matches * 0.14) + semantic_boost + (semantic_hits * 0.18))
                    scored_chunks.append((score, source, section))

        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        return scored_chunks[:top_k]
