import unittest
from fastapi.testclient import TestClient
from main import app
from app.langgraph.workflow import run_campus_agent
from app.ticketing.mock import get_ticketing_client


class TestCampSupportBackend(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_01_health_check(self):
        """Verify that backend server health check returns 200 OK."""
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "healthy")

    def test_02_rag_citation_retrieval(self):
        """Verify that a Wi-Fi query retrieves citations from wifi_email_sop.txt."""
        response = run_campus_agent(query="How do I connect to campus Wi-Fi?")
        self.assertGreater(response.confidence_score, 0.4)
        self.assertTrue(len(response.citations) > 0)
        self.assertEqual(response.citations[0].source_document, "wifi_email_sop.txt")
        self.assertFalse(response.requires_follow_up)

    def test_03_guided_detail_collection(self):
        """Verify that reporting a hostel repair without room number triggers follow-up."""
        response = run_campus_agent(query="There is an electrical repair fault in Hostel Block A light")
        self.assertTrue(response.requires_follow_up)
        self.assertIn("room_number", response.missing_fields)

    def test_04_ticket_creation_and_routing(self):
        """Verify that an explicit escalation creates a ticket routed to Campus IT."""
        response = run_campus_agent(query="I need a human helpdesk agent to escalate my network login bug")
        self.assertIsNotNone(response.ticket_created)
        self.assertEqual(response.department_routed, "Campus IT")
        self.assertIn("#TICK-", response.ticket_created["ticket_id"])

    def test_05_semantic_internet_access_query(self):
        """Verify semantic intent such as 'internet access' resolves to the Wi-Fi policy document."""
        response = run_campus_agent(query="How can I access the internet on campus?")
        self.assertGreater(response.confidence_score, 0.4)
        self.assertTrue(len(response.citations) > 0)
        self.assertEqual(response.citations[0].source_document, "wifi_email_sop.txt")
        self.assertFalse(response.requires_follow_up)

    def test_06_api_chat_endpoint(self):
        """Test POST /api/v1/chat API endpoint."""
        payload = {
            "message": "What is the minimum attendance required for semester exams?",
            "user_id": "student-test-01"
        }
        res = self.client.post("/api/v1/chat/", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("75%", data["answer"])
        self.assertEqual(data["citations"][0]["source_document"], "academic_calendar_2026.txt")


if __name__ == "__main__":
    unittest.main()
