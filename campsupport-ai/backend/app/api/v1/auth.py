import uuid
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, status
from app.schemas.auth import (
    StudentSignUp,
    TeacherSignUp,
    AdminSignUp,
    LoginRequest,
    AuthResponse,
    UserRole,
)
from app.db.auth_db import (
    init_auth_databases,
    get_student_by_email,
    create_student_record,
    get_teacher_by_email,
    create_teacher_record,
    get_admin_by_email,
    create_admin_record,
)

router = APIRouter(tags=["Multi-Role Authentication & Dedicated SQLite Database Files"])

# Initialize the 3 physically separate SQLite database files on startup
init_auth_databases()


@router.post("/signup/student", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup_student(data: StudentSignUp) -> AuthResponse:
    """Registers a student in the dedicated students.db SQLite database file."""
    init_auth_databases()
    existing = get_student_by_email(data.college_email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student with this college email is already registered in students.db.",
        )

    record = create_student_record(
        name=data.name,
        roll_no=data.roll_no,
        class_name=data.class_name,
        department=data.department,
        college_email=data.college_email,
        password=data.password,
    )

    return AuthResponse(
        user_id=record["id"],
        role="STUDENT",
        name=record["name"],
        email=record["college_email"],
        department=record["department"],
        roll_no=record["roll_no"],
        class_name=record["class_name"],
        token=f"jwt-stud-{uuid.uuid4()}",
        message="Student account created successfully in students.db SQLite Database.",
    )


@router.post("/signup/teacher", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup_teacher(data: TeacherSignUp) -> AuthResponse:
    """Registers a teacher in the dedicated teachers.db SQLite database file."""
    init_auth_databases()
    existing = get_teacher_by_email(data.college_email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Teacher with this college email is already registered in teachers.db.",
        )

    record = create_teacher_record(
        name=data.name,
        department=data.department,
        teacher_id=data.teacher_id,
        college_email=data.college_email,
        password=data.password,
    )

    return AuthResponse(
        user_id=record["id"],
        role="TEACHER",
        name=record["name"],
        email=record["college_email"],
        department=record["department"],
        teacher_id=record["teacher_id"],
        token=f"jwt-fac-{uuid.uuid4()}",
        message="Teacher account created successfully in teachers.db SQLite Database.",
    )


@router.post("/signup/admin", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup_admin(data: AdminSignUp) -> AuthResponse:
    """Registers an admin in the dedicated admins.db SQLite database file."""
    init_auth_databases()
    existing = get_admin_by_email(data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin with this email is already registered in admins.db.",
        )

    record = create_admin_record(
        name=data.name,
        admin_id=data.admin_id,
        email=data.email,
        password=data.password,
    )

    return AuthResponse(
        user_id=record["id"],
        role="ADMIN",
        name=record["name"],
        email=record["email"],
        admin_id=record["admin_id"],
        token=f"jwt-adm-{uuid.uuid4()}",
        message="Admin account created successfully in admins.db SQLite Database.",
    )


@router.post("/login", response_model=AuthResponse)
async def login_user(data: LoginRequest) -> AuthResponse:
    """Authenticates user against the specified role's dedicated SQLite database file."""
    init_auth_databases()
    record = None

    if data.role == "STUDENT":
        record = get_student_by_email(data.email)
        if record and record["password"] == data.password:
            return AuthResponse(
                user_id=record["id"],
                role="STUDENT",
                name=record["name"],
                email=record["college_email"],
                department=record["department"],
                roll_no=record["roll_no"],
                class_name=record["class_name"],
                token=f"jwt-stud-{uuid.uuid4()}",
                message="Successfully authenticated against students.db SQLite Database.",
            )
    elif data.role == "TEACHER":
        record = get_teacher_by_email(data.email)
        if record and record["password"] == data.password:
            return AuthResponse(
                user_id=record["id"],
                role="TEACHER",
                name=record["name"],
                email=record["college_email"],
                department=record["department"],
                teacher_id=record["teacher_id"],
                token=f"jwt-fac-{uuid.uuid4()}",
                message="Successfully authenticated against teachers.db SQLite Database.",
            )
    elif data.role == "ADMIN":
        record = get_admin_by_email(data.email)
        if record and record["password"] == data.password:
            return AuthResponse(
                user_id=record["id"],
                role="ADMIN",
                name=record["name"],
                email=record["email"],
                admin_id=record["admin_id"],
                token=f"jwt-adm-{uuid.uuid4()}",
                message="Successfully authenticated against admins.db SQLite Database.",
            )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=f"Invalid email or password for {data.role} SQLite database.",
    )
