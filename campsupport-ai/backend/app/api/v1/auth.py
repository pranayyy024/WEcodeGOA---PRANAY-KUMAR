import uuid
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, status
from app.schemas.auth import (
    StudentSignUp,
    TeacherSignUp,
    AdminSignUp,
    LoginRequest,
    AuthResponse,
    UserRole,
)

router = APIRouter(tags=["Multi-Role Authentication & Dedicated Credentials Databases"])

# 3 SEPARATE CREDENTIALS DATABASES / COLLECTIONS
_STUDENTS_DB: Dict[str, Dict[str, Any]] = {
    "student@pcce.ac.in": {
        "user_id": "stud-1001",
        "role": "STUDENT",
        "name": "Rahul Sharma",
        "roll_no": "2024CS001",
        "class_name": "SE-CS",
        "department": "Computer Science",
        "college_email": "student@pcce.ac.in",
        "password": "pass123",
    }
}

_TEACHERS_DB: Dict[str, Dict[str, Any]] = {
    "teacher@pcce.ac.in": {
        "user_id": "fac-101",
        "role": "TEACHER",
        "name": "Dr. Rajesh Kulkarni",
        "department": "Campus IT",
        "teacher_id": "FAC-101",
        "college_email": "teacher@pcce.ac.in",
        "password": "pass123",
    }
}

_ADMINS_DB: Dict[str, Dict[str, Any]] = {
    "admin@pcce.ac.in": {
        "user_id": "adm-001",
        "role": "ADMIN",
        "name": "Prof. Anita Desai",
        "admin_id": "ADM-001",
        "email": "admin@pcce.ac.in",
        "password": "pass123",
    }
}


@router.post("/signup/student", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup_student(data: StudentSignUp) -> AuthResponse:
    """Registers a student in the dedicated students database."""
    email_key = data.college_email.lower().strip()
    if email_key in _STUDENTS_DB:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student with this college email is already registered.",
        )

    user_id = f"stud-{int(len(_STUDENTS_DB) + 1001)}"
    record = {
        "user_id": user_id,
        "role": "STUDENT",
        "name": data.name,
        "roll_no": data.roll_no,
        "class_name": data.class_name,
        "department": data.department,
        "college_email": email_key,
        "password": data.password,
    }
    _STUDENTS_DB[email_key] = record

    return AuthResponse(
        user_id=user_id,
        role="STUDENT",
        name=data.name,
        email=email_key,
        department=data.department,
        roll_no=data.roll_no,
        class_name=data.class_name,
        token=f"jwt-stud-{uuid.uuid4()}",
        message="Student account created successfully in Students Database.",
    )


@router.post("/signup/teacher", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup_teacher(data: TeacherSignUp) -> AuthResponse:
    """Registers a teacher in the dedicated teachers database."""
    email_key = data.college_email.lower().strip()
    if email_key in _TEACHERS_DB:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Teacher with this college email is already registered.",
        )

    user_id = f"fac-{int(len(_TEACHERS_DB) + 101)}"
    record = {
        "user_id": user_id,
        "role": "TEACHER",
        "name": data.name,
        "department": data.department,
        "teacher_id": data.teacher_id,
        "college_email": email_key,
        "password": data.password,
    }
    _TEACHERS_DB[email_key] = record

    return AuthResponse(
        user_id=user_id,
        role="TEACHER",
        name=data.name,
        email=email_key,
        department=data.department,
        teacher_id=data.teacher_id,
        token=f"jwt-fac-{uuid.uuid4()}",
        message="Teacher account created successfully in Teachers Database.",
    )


@router.post("/signup/admin", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup_admin(data: AdminSignUp) -> AuthResponse:
    """Registers an admin in the dedicated admins database."""
    email_key = data.email.lower().strip()
    if email_key in _ADMINS_DB:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin with this email is already registered.",
        )

    user_id = f"adm-{int(len(_ADMINS_DB) + 1)}"
    record = {
        "user_id": user_id,
        "role": "ADMIN",
        "name": data.name,
        "admin_id": data.admin_id,
        "email": email_key,
        "password": data.password,
    }
    _ADMINS_DB[email_key] = record

    return AuthResponse(
        user_id=user_id,
        role="ADMIN",
        name=data.name,
        email=email_key,
        admin_id=data.admin_id,
        token=f"jwt-adm-{uuid.uuid4()}",
        message="Admin account created successfully in Admins Database.",
    )


@router.post("/login", response_model=AuthResponse)
async def login_user(data: LoginRequest) -> AuthResponse:
    """Authenticates user against the specified role's dedicated credentials database."""
    email_key = data.email.lower().strip()
    record = None

    if data.role == "STUDENT":
        record = _STUDENTS_DB.get(email_key)
    elif data.role == "TEACHER":
        record = _TEACHERS_DB.get(email_key)
    elif data.role == "ADMIN":
        record = _ADMINS_DB.get(email_key)

    if not record or record.get("password") != data.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid email or password for {data.role} database.",
        )

    return AuthResponse(
        user_id=record["user_id"],
        role=data.role,
        name=record["name"],
        email=email_key,
        department=record.get("department"),
        roll_no=record.get("roll_no"),
        class_name=record.get("class_name"),
        teacher_id=record.get("teacher_id"),
        admin_id=record.get("admin_id"),
        token=f"jwt-{data.role.lower()}-{uuid.uuid4()}",
        message=f"Successfully authenticated against {data.role} Database.",
    )
