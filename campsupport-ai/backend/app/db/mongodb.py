import os
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone

try:
    from pymongo import MongoClient, DESCENDING
    from pymongo.collection import Collection
    PYMONGO_AVAILABLE = True
except ImportError:
    PYMONGO_AVAILABLE = False


class MongoDBTicketStore:
    """
    Manages all support ticket persistence using MongoDB Atlas.
    Falls back to an in-memory dict if Atlas is unreachable.
    """

    def __init__(self):
        uri = os.getenv("DATABASE_URL", "")
        self._client = None
        self._db = None
        self._connected = False

        if not PYMONGO_AVAILABLE:
            print("[MongoDB] pymongo not installed — using in-memory fallback.")
            self._fallback: Dict[str, Any] = {}
            return

        if not uri or uri.strip() == "":
            print("[MongoDB] DATABASE_URL not set — using in-memory fallback.")
            self._fallback: Dict[str, Any] = {}
            return

        try:
            self._client = MongoClient(uri, serverSelectionTimeoutMS=4000)
            self._db = self._client["campsupport"]
            # Verify connection with a quick ping
            self._client.admin.command("ping")
            self._connected = True
            print("[MongoDB] ✅ Connected to MongoDB Atlas successfully.")
        except Exception as exc:
            print(f"[MongoDB] ⚠️  Atlas connection failed ({exc}). Using in-memory fallback.")
            self._client = None
            self._db = None
            self._fallback: Dict[str, Any] = {}

    @property
    def _tickets_collection(self) -> Optional[Any]:
        if self._connected and self._db is not None:
            return self._db["tickets"]
        return None

    # ─── CREATE ────────────────────────────────────────────────────────────────

    def save_ticket(self, ticket: Dict[str, Any]) -> bool:
        """Persists a new ticket document to MongoDB Atlas (or fallback dict)."""
        if self._tickets_collection is not None:
            try:
                result = self._tickets_collection.insert_one(ticket)
                return result.acknowledged
            except Exception as e:
                print(f"[MongoDB] save_ticket error: {e}")
                return False
        # Fallback
        self._fallback[ticket["ticket_id"]] = ticket
        return True

    # ─── READ ──────────────────────────────────────────────────────────────────

    def get_all_tickets(self, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Returns all tickets for a user (or all tickets if user_id is None), newest first."""
        if self._tickets_collection is not None:
            try:
                query = {"user_id": user_id} if user_id else {}
                cursor = self._tickets_collection.find(query, {"_id": 0}).sort(
                    "created_at", DESCENDING
                )
                return list(cursor)
            except Exception as e:
                print(f"[MongoDB] get_all_tickets error: {e}")
                return []
        # Fallback
        tickets = list(self._fallback.values())
        if user_id:
            tickets = [t for t in tickets if t.get("user_id") == user_id]
        return sorted(tickets, key=lambda t: t.get("created_at", ""), reverse=True)

    def get_ticket(self, ticket_id: str) -> Optional[Dict[str, Any]]:
        """Fetches a single ticket by its ID."""
        if self._tickets_collection is not None:
            try:
                return self._tickets_collection.find_one({"ticket_id": ticket_id}, {"_id": 0})
            except Exception as e:
                print(f"[MongoDB] get_ticket error: {e}")
                return None
        return self._fallback.get(ticket_id)

    # ─── UPDATE ────────────────────────────────────────────────────────────────

    def update_ticket_status(self, ticket_id: str, new_status: str) -> bool:
        """Updates the status field of an existing ticket."""
        updated_at = datetime.now(timezone.utc).isoformat()
        if self._tickets_collection is not None:
            try:
                result = self._tickets_collection.update_one(
                    {"ticket_id": ticket_id},
                    {"$set": {"status": new_status, "updated_at": updated_at}},
                )
                return result.modified_count > 0
            except Exception as e:
                print(f"[MongoDB] update_ticket_status error: {e}")
                return False
        # Fallback
        if ticket_id in self._fallback:
            self._fallback[ticket_id]["status"] = new_status
            self._fallback[ticket_id]["updated_at"] = updated_at
            return True
        return False

    @property
    def is_connected(self) -> bool:
        return self._connected


# ─── Singleton ──────────────────────────────────────────────────────────────────

_ticket_store = MongoDBTicketStore()


def get_ticket_store() -> MongoDBTicketStore:
    return _ticket_store
