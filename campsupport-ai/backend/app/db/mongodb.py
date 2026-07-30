import os
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone
from app.core.config import settings

try:
    from pymongo import MongoClient
    from pymongo.collection import Collection
    from pymongo.database import Database
    PYMONGO_AVAILABLE = True
except ImportError:
    PYMONGO_AVAILABLE = False


class MongoDBClient:
    """Manages connections to MongoDB (Local or Atlas Cloud) for storing helpdesk tickets and conversation logs."""

    def __init__(self, uri: Optional[str] = None, db_name: str = "campsupport"):
        self.uri = uri or os.getenv("MONGODB_URL", os.getenv("DATABASE_URL", "mongodb://localhost:27017"))
        self.db_name = db_name
        self._client: Optional[Any] = None
        self._db: Optional[Any] = None

    def connect(self) -> bool:
        """Establishes connection to MongoDB."""
        if not PYMONGO_AVAILABLE:
            print("PyMongo is not installed. Using in-memory fallback.")
            return False

        try:
            self._client = MongoClient(self.uri, serverSelectionTimeoutMS=2000)
            self._db = self._client[self.db_name]
            # Verify connection
            self._client.admin.command('ping')
            return True
        except Exception as exc:
            print(f"MongoDB connection failed ({exc}). Using in-memory fallback.")
            self._client = None
            self._db = None
            return False

    def get_collection(self, collection_name: str) -> Optional[Any]:
        """Returns a MongoDB collection instance if connected."""
        if self._db is not None:
            return self._db[collection_name]
        return None

    def save_ticket(self, ticket_data: Dict[str, Any]) -> bool:
        """Inserts a new support ticket document into the 'tickets' collection."""
        coll = self.get_collection("tickets")
        if coll is not None:
            try:
                coll.insert_one(ticket_data)
                return True
            except Exception as e:
                print(f"Error saving ticket to MongoDB: {e}")
        return False

    def get_all_tickets(self) -> List[Dict[str, Any]]:
        """Retrieves all tickets from MongoDB, stripping internal _id for clean API response."""
        coll = self.get_collection("tickets")
        if coll is not None:
            tickets = []
            for doc in coll.find({}, {"_id": 0}):
                tickets.append(doc)
            return tickets
        return []


# Singleton MongoDB instance
_mongodb_client_instance = MongoDBClient()


def get_mongodb_client() -> MongoDBClient:
    return _mongodb_client_instance
