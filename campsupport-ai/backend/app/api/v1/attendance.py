from typing import List, Dict, Optional
from fastapi import APIRouter, HTTPException, status, Query
from app.schemas.attendance import AttendanceRecord, AttendanceCreate, AttendanceUpdate

router = APIRouter(tags=["Student Attendance & Role-Based Management"])

# In-memory mock attendance registry per college for demo
_ATTENDANCE_REGISTRY: Dict[str, List[AttendanceRecord]] = {
    "GEC": [
        AttendanceRecord(
            record_id="att-gec-1",
            college_id="GEC",
            student_id="2024CS001",
            student_name="Rahul Sharma",
            course_code="CS201",
            course_name="Data Structures & Algorithms",
            total_classes=40,
            attended_classes=31,
            attendance_percentage=77.5,
            status="SAFE",
            medical_leave_submitted=False,
            medical_leave_verified=False,
        ),
        AttendanceRecord(
            record_id="att-gec-2",
            college_id="GEC",
            student_id="2024CS001",
            student_name="Rahul Sharma",
            course_code="CS203",
            course_name="Computer Networks",
            total_classes=38,
            attended_classes=27,
            attendance_percentage=71.0,
            status="WARNING",
            medical_leave_submitted=True,
            medical_leave_verified=False,
        ),
        AttendanceRecord(
            record_id="att-gec-3",
            college_id="GEC",
            student_id="2024CS001",
            student_name="Rahul Sharma",
            course_code="MA201",
            course_name="Engineering Mathematics III",
            total_classes=42,
            attended_classes=35,
            attendance_percentage=83.3,
            status="SAFE",
            medical_leave_submitted=False,
            medical_leave_verified=False,
        ),
    ],
    "BITS_PILANI": [
        AttendanceRecord(
            record_id="att-bits-1",
            college_id="BITS_PILANI",
            student_id="2024A7PS001",
            student_name="Ananya Verma",
            course_code="CS F211",
            course_name="Data Structures & Algorithms",
            total_classes=45,
            attended_classes=38,
            attendance_percentage=84.4,
            status="SAFE",
            medical_leave_submitted=False,
            medical_leave_verified=False,
        ),
    ],
    "IIT_BOMBAY": [
        AttendanceRecord(
            record_id="att-iitb-1",
            college_id="IIT_BOMBAY",
            student_id="230050001",
            student_name="Vikramaditya Rao",
            course_code="CS 207",
            course_name="Discrete Structures",
            total_classes=36,
            attended_classes=26,
            attendance_percentage=72.2,
            status="WARNING",
            medical_leave_submitted=True,
            medical_leave_verified=True,
        ),
    ],
}


def _calc_status(percent: float, medical_verified: bool) -> str:
    if percent >= 75.0 or medical_verified:
        return "SAFE"
    elif percent >= 65.0:
        return "WARNING"
    return "CRITICAL"


@router.get("/", response_model=List[AttendanceRecord])
async def get_attendance(
    college_id: str = Query("GEC", description="College tenant identifier"),
    student_id: Optional[str] = Query(None, description="Optional student ID filter"),
) -> List[AttendanceRecord]:
    """Returns attendance records for a specific college, optionally filtered by student ID."""
    records = _ATTENDANCE_REGISTRY.get(college_id, [])
    if student_id:
        return [r for r in records if r.student_id == student_id]
    return records


@router.post("/update", response_model=AttendanceRecord)
async def update_attendance(
    update_data: AttendanceUpdate,
    college_id: str = Query("GEC")
) -> AttendanceRecord:
    """Teacher / Staff endpoint to modify attendance classes or verify medical leave certificates."""
    records = _ATTENDANCE_REGISTRY.get(college_id, [])
    for rec in records:
        if rec.record_id == update_data.record_id:
            if update_data.attended_classes is not None:
                rec.attended_classes = update_data.attended_classes
            if update_data.total_classes is not None:
                rec.total_classes = update_data.total_classes
            if update_data.medical_leave_verified is not None:
                rec.medical_leave_verified = update_data.medical_leave_verified

            rec.attendance_percentage = round(
                (rec.attended_classes / max(1, rec.total_classes)) * 100.0, 1
            )
            rec.status = _calc_status(rec.attendance_percentage, rec.medical_leave_verified)
            return rec

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Attendance record {update_data.record_id} not found in {college_id}"
    )


@router.post("/add", response_model=AttendanceRecord, status_code=status.HTTP_201_CREATED)
async def add_attendance_record(
    create_data: AttendanceCreate
) -> AttendanceRecord:
    """Teacher endpoint to add a new course attendance record for a student."""
    percent = round(
        (create_data.attended_classes / max(1, create_data.total_classes)) * 100.0, 1
    )
    rec_id = f"att-{create_data.college_id.lower()}-{int(len(_ATTENDANCE_REGISTRY.get(create_data.college_id, [])) + 1)}"
    new_record = AttendanceRecord(
        record_id=rec_id,
        college_id=create_data.college_id,
        student_id=create_data.student_id,
        student_name=create_data.student_name,
        course_code=create_data.course_code,
        course_name=create_data.course_name,
        total_classes=create_data.total_classes,
        attended_classes=create_data.attended_classes,
        attendance_percentage=percent,
        status=_calc_status(percent, False),
        medical_leave_submitted=create_data.medical_leave_submitted,
        medical_leave_verified=False,
    )

    if create_data.college_id not in _ATTENDANCE_REGISTRY:
        _ATTENDANCE_REGISTRY[create_data.college_id] = []
    _ATTENDANCE_REGISTRY[create_data.college_id].append(new_record)

    return new_record
