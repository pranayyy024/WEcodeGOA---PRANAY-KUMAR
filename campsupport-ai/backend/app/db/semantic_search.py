import re
from typing import Any, Dict, List, Tuple


SEMANTIC_ALIAS_GROUPS: Dict[str, Tuple[str, ...]] = {
    "wifi": (
        "wifi", "wi-fi", "eduroam", "campusnet", "ssid", "802.1x", "wireless",
    ),
    "attendance": (
        "attendance", "condonation", "detain", "75%", "attendance required",
    ),
    "hostel": (
        "hostel", "curfew", "warden", "hostel block", "mess", "boarding",
    ),
    "fees": (
        "fee", "fees", "payment", "installment", "penalty", "due date", "surcharge",
    ),
    "grading": (
        "cgpa", "gpa", "grade", "grading", "marks", "sgpa", "credit points",
    ),
    "rules": (
        "code of conduct", "dress code", "ragging", "prohibited", "fine", "formal shirt", "rules_and_regulations",
    ),
    "syllabus": (
        "syllabus", "course", "subject", "curriculum", "engineering", "syllabus_cse",
    ),
    "timetable": (
        "timetable", "schedule", "lecture", "lab", "period", "slot", "timing",
    ),
}

STOPWORDS = {
    "how", "do", "i", "to", "the", "a", "an", "in", "for", "of", "on", "what", "is",
    "where", "when", "why", "who", "which", "are", "can", "should", "would", "could",
    "my", "your", "our", "their", "this", "that", "it", "with", "from", "by", "about",
    "on", "at", "be", "have", "has", "had", "will", "shall", "does", "did", "not",
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
        raw_terms = [w.lower() for w in re.findall(r"[\w-]+", query) if len(w) >= 2]
        query_terms = [w for w in raw_terms if w not in STOPWORDS]
        if not query_terms:
            query_terms = raw_terms
        if not query_terms:
            return []

        scored_chunks: List[Tuple[float, str, str]] = []
        query_lower = query.lower()

        for doc in documents:
            source = doc["source"]
            content = doc["content"]
            source_lower = source.lower()
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
                        semantic_boost += 0.35
                        if any(kw in source_lower for kw in ("sop", "policy", "rules", "calendar", "faq", "timetable", "syllabus", group_name)):
                            semantic_boost += 0.45

                lexical_matches = sum(1 for term in query_terms if term in section_lower or term.replace("-", "") in section_lower.replace("-", ""))
                if semantic_hits > 0 or lexical_matches > 0:
                    filename_bonus = 0.50 if any(term.replace("-", "") in source_lower for term in query_terms if len(term.replace("-", "")) >= 3) else 0.0
                    sop_bonus = 0.40 if "sop" in source_lower or source_lower.endswith(".txt") else 0.0
                    overview_penalty = -0.30 if any(kw in source_lower for kw in ("info", "readme", "overview", "index")) else 0.0
                    raw_score = 0.25 + (lexical_matches * 0.25) + semantic_boost + (semantic_hits * 0.20) + filename_bonus + sop_bonus + overview_penalty
                    scored_chunks.append((raw_score, source, section))

        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        return [(min(0.99, max(0.10, score)), source, section) for score, source, section in scored_chunks[:top_k]]
