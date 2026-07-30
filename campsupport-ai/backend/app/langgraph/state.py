from dataclasses import dataclass, field
from typing import Optional

@dataclass
class GraphState:
    user_query: str = ""
    context: dict = field(default_factory=dict)
    verification: Optional[bool] = None
    ticket_data: Optional[dict] = None
