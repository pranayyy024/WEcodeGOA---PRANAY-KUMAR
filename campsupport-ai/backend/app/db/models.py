from dataclasses import dataclass

@dataclass
class Ticket:
    id: str
    title: str
    status: str = "open"
