from typing import Optional, List
from pydantic import BaseModel, Field


class AttendanceRecord(BaseModel):
    record_id: str = Field(..., description="Unique ID of attendance record")
    college_id: str = Field(..., description="College tenant identifier (GEC, BITS_PILANI, IIT_BOMBAY)")
    student_id: str = Field(..., description="Student roll number or ID")
    student_name: str = Field(..., description="Full name of student")
    course_code: str = Field(..., description="Course code (e.g., CS201)")
    course_name: str = Field(..., description="Full course title")
    total_classes: int = Field(..., description="Total lecture classes held")
    attended_classes: int = Field(..., description="Classes attended by student")
    attendance_percentage: float = Field(..., description="Calculated attendance percentage")
    status: str = Field("SAFE", description="Status badge: SAFE, WARNING, or CRITICAL")
    medical_leave_submitted: bool = Field(False, description="Whether a medical certificate was submitted")
    medical_leave_verified: bool = Field(False, description="Whether teacher verified medical leave")


class AttendanceCreate(BaseModel):
    college_id: str
    student_id: str
    student_name: str
    course_code: str
    course_name: str
    total_classes: int
    attended_classes: int
    medical_leave_submitted: bool = False


class AttendanceUpdate(BaseModel):
    record_id: str
    attended_classes: Optional[int] = None
    total_classes: Optional[int] = None
    medical_leave_verified: Optional[bool] = None
