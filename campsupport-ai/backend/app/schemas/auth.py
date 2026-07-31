from typing import Optional, Literal
from pydantic import BaseModel, EmailStr, Field


UserRole = Literal["STUDENT", "TEACHER", "ADMIN"]


class StudentSignUp(BaseModel):
    name: str = Field(..., description="Full Name of Student")
    roll_no: str = Field(..., description="Student Roll Number (e.g. 2024CS001)")
    class_name: str = Field(..., description="Student Class (e.g. SE-CS)")
    department: str = Field(..., description="Department (e.g. Computer Science)")
    college_email: str = Field(..., description="College email address")
    password: str = Field(..., description="Account password")


class TeacherSignUp(BaseModel):
    name: str = Field(..., description="Full Name of Teacher / Staff")
    department: str = Field(..., description="Department (e.g. Campus IT)")
    teacher_id: str = Field(..., description="Teacher ID (e.g. FAC-101)")
    college_email: str = Field(..., description="College email address")
    password: str = Field(..., description="Account password")


class AdminSignUp(BaseModel):
    name: str = Field(..., description="Full Name of Administrator")
    admin_id: str = Field(..., description="Admin ID (e.g. ADM-001)")
    email: str = Field(..., description="Admin email address")
    password: str = Field(..., description="Account password")


class LoginRequest(BaseModel):
    role: UserRole = Field(..., description="Role database to authenticate against")
    email: str = Field(..., description="Email address")
    password: str = Field(..., description="Password")


class AuthResponse(BaseModel):
    user_id: str
    role: UserRole
    name: str
    email: str
    department: Optional[str] = None
    roll_no: Optional[str] = None
    class_name: Optional[str] = None
    teacher_id: Optional[str] = None
    admin_id: Optional[str] = None
    token: str
    message: str
