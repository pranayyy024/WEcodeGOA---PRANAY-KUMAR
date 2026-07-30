from typing import Optional

class Database:
    def __init__(self, connection_string: Optional[str] = None):
        self.connection_string = connection_string

    def connect(self):
        return {"status": "not_connected"}
