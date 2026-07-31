import sqlite3
import os
import uuid
from typing import Optional, Dict, Any

# Ensure data directory exists in backend root
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data")
os.makedirs(DATA_DIR, exist_ok=True)

# 3 SEPARATE, PHYSICALLY ISOLATED SQLITE DATABASE FILES
STUDENTS_DB_PATH = os.path.join(DATA_DIR, "students.db")
TEACHERS_DB_PATH = os.path.join(DATA_DIR, "teachers.db")
ADMINS_DB_PATH = os.path.join(DATA_DIR, "admins.db")


def init_auth_databases():
    """Initializes 3 separate SQLite database files for Students, Teachers, and Admins."""

    # 1. STUDENTS DATABASE (`students.db`)
    with sqlite3.connect(STUDENTS_DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS students (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                roll_no TEXT NOT NULL,
                class_name TEXT NOT NULL,
                department TEXT NOT NULL,
                college_email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )
        """)
        # Seed default PCCE student demo account if empty
        cursor.execute("SELECT COUNT(*) FROM students")
        if cursor.fetchone()[0] == 0:
            cursor.execute("""
                INSERT INTO students (id, name, roll_no, class_name, department, college_email, password)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, ("stud-1001", "Rahul Sharma", "2024CS001", "SE-CS", "Computer Science", "student@pcce.ac.in", "pass123"))
        conn.commit()

    # 2. TEACHERS DATABASE (`teachers.db`)
    with sqlite3.connect(TEACHERS_DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS teachers (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                department TEXT NOT NULL,
                teacher_id TEXT NOT NULL,
                college_email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )
        """)
        # Seed default PCCE teacher demo account if empty
        cursor.execute("SELECT COUNT(*) FROM teachers")
        if cursor.fetchone()[0] == 0:
            cursor.execute("""
                INSERT INTO teachers (id, name, department, teacher_id, college_email, password)
                VALUES (?, ?, ?, ?, ?, ?)
            """, ("fac-101", "Dr. Rajesh Kulkarni", "Campus IT", "FAC-101", "teacher@pcce.ac.in", "pass123"))
        conn.commit()

    # 3. ADMINS DATABASE (`admins.db`)
    with sqlite3.connect(ADMINS_DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS admins (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                admin_id TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )
        """)
        # Seed default PCCE admin demo account if empty
        cursor.execute("SELECT COUNT(*) FROM admins")
        if cursor.fetchone()[0] == 0:
            cursor.execute("""
                INSERT INTO admins (id, name, admin_id, email, password)
                VALUES (?, ?, ?, ?, ?)
            """, ("adm-001", "Prof. Anita Desai", "ADM-001", "admin@pcce.ac.in", "pass123"))
        conn.commit()


# =====================================================================
# STUDENTS DATABASE OPERATIONS (`students.db`)
# =====================================================================
def get_student_by_email(email: str) -> Optional[Dict[str, Any]]:
    with sqlite3.connect(STUDENTS_DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM students WHERE LOWER(college_email) = LOWER(?)", (email.strip(),))
        row = cursor.fetchone()
        if row:
            return dict(row)
    return None


def create_student_record(name: str, roll_no: str, class_name: str, department: str, college_email: str, password: str) -> Dict[str, Any]:
    user_id = f"stud-{uuid.uuid4().hex[:8]}"
    with sqlite3.connect(STUDENTS_DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO students (id, name, roll_no, class_name, department, college_email, password)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (user_id, name, roll_no, class_name, department, college_email.lower().strip(), password))
        conn.commit()
    return {
        "id": user_id,
        "name": name,
        "roll_no": roll_no,
        "class_name": class_name,
        "department": department,
        "college_email": college_email.lower().strip(),
        "password": password,
    }


# =====================================================================
# TEACHERS DATABASE OPERATIONS (`teachers.db`)
# =====================================================================
def get_teacher_by_email(email: str) -> Optional[Dict[str, Any]]:
    with sqlite3.connect(TEACHERS_DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM teachers WHERE LOWER(college_email) = LOWER(?)", (email.strip(),))
        row = cursor.fetchone()
        if row:
            return dict(row)
    return None


def create_teacher_record(name: str, department: str, teacher_id: str, college_email: str, password: str) -> Dict[str, Any]:
    user_id = f"fac-{uuid.uuid4().hex[:8]}"
    with sqlite3.connect(TEACHERS_DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO teachers (id, name, department, teacher_id, college_email, password)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (user_id, name, department, teacher_id, college_email.lower().strip(), password))
        conn.commit()
    return {
        "id": user_id,
        "name": name,
        "department": department,
        "teacher_id": teacher_id,
        "college_email": college_email.lower().strip(),
        "password": password,
    }


# =====================================================================
# ADMINS DATABASE OPERATIONS (`admins.db`)
# =====================================================================
def get_admin_by_email(email: str) -> Optional[Dict[str, Any]]:
    with sqlite3.connect(ADMINS_DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM admins WHERE LOWER(email) = LOWER(?)", (email.strip(),))
        row = cursor.fetchone()
        if row:
            return dict(row)
    return None


def create_admin_record(name: str, admin_id: str, email: str, password: str) -> Dict[str, Any]:
    user_id = f"adm-{uuid.uuid4().hex[:8]}"
    with sqlite3.connect(ADMINS_DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO admins (id, name, admin_id, email, password)
            VALUES (?, ?, ?, ?, ?)
        """, (user_id, name, admin_id, email.lower().strip(), password))
        conn.commit()
    return {
        "id": user_id,
        "name": name,
        "admin_id": admin_id,
        "email": email.lower().strip(),
        "password": password,
    }
