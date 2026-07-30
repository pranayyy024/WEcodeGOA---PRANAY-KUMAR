import unittest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


class TestAuthEndpoints(unittest.TestCase):
    def test_student_login_demo(self):
        res = client.post(
            "/api/v1/auth/login",
            json={
                "role": "STUDENT",
                "email": "student@gec.ac.in",
                "password": "pass123",
            },
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["role"], "STUDENT")
        self.assertEqual(data["roll_no"], "2024CS001")

    def test_teacher_signup_and_login(self):
        # Sign up new teacher
        res_signup = client.post(
            "/api/v1/auth/signup/teacher",
            json={
                "name": "Prof. Alan Turing",
                "department": "Computer Science",
                "teacher_id": "FAC-999",
                "college_email": "turing@gec.ac.in",
                "password": "enigma_pass",
            },
        )
        self.assertEqual(res_signup.status_code, 201)

        # Login new teacher
        res_login = client.post(
            "/api/v1/auth/login",
            json={
                "role": "TEACHER",
                "email": "turing@gec.ac.in",
                "password": "enigma_pass",
            },
        )
        self.assertEqual(res_login.status_code, 200)
        self.assertEqual(res_login.json()["teacher_id"], "FAC-999")

    def test_admin_login_demo(self):
        res = client.post(
            "/api/v1/auth/login",
            json={
                "role": "ADMIN",
                "email": "admin@gec.ac.in",
                "password": "pass123",
            },
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["admin_id"], "ADM-001")


if __name__ == "__main__":
    unittest.main()
