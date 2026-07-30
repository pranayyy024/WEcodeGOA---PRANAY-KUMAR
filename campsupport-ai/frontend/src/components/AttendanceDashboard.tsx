'use client';

import React, { useState } from 'react';
import {
  CalendarCheck,
  AlertTriangle,
  CheckCircle2,
  PlusCircle,
  Edit3,
  ShieldAlert,
  UserCheck,
  Building2,
  Search,
  FileText,
  TrendingUp,
  Award,
} from 'lucide-react';

export interface AttendanceItem {
  record_id: string;
  college_id: string;
  student_id: string;
  student_name: string;
  course_code: string;
  course_name: string;
  total_classes: number;
  attended_classes: number;
  attendance_percentage: number;
  status: 'SAFE' | 'WARNING' | 'CRITICAL';
  medical_leave_submitted: boolean;
  medical_leave_verified: boolean;
}

const INITIAL_ATTENDANCE: AttendanceItem[] = [
  {
    record_id: 'att-gec-1',
    college_id: 'GEC',
    student_id: '2024CS001',
    student_name: 'Rahul Sharma',
    course_code: 'CS201',
    course_name: 'Data Structures & Algorithms',
    total_classes: 40,
    attended_classes: 31,
    attendance_percentage: 77.5,
    status: 'SAFE',
    medical_leave_submitted: false,
    medical_leave_verified: false,
  },
  {
    record_id: 'att-gec-2',
    college_id: 'GEC',
    student_id: '2024CS001',
    student_name: 'Rahul Sharma',
    course_code: 'CS203',
    course_name: 'Computer Networks',
    total_classes: 38,
    attended_classes: 27,
    attendance_percentage: 71.0,
    status: 'WARNING',
    medical_leave_submitted: true,
    medical_leave_verified: false,
  },
  {
    record_id: 'att-gec-3',
    college_id: 'GEC',
    student_id: '2024CS001',
    student_name: 'Rahul Sharma',
    course_code: 'MA201',
    course_name: 'Engineering Mathematics III',
    total_classes: 42,
    attended_classes: 35,
    attendance_percentage: 83.3,
    status: 'SAFE',
    medical_leave_submitted: false,
    medical_leave_verified: false,
  },
];

interface AttendanceDashboardProps {
  role?: 'STUDENT' | 'TEACHER';
  collegeId?: string;
}

export const AttendanceDashboard: React.FC<AttendanceDashboardProps> = ({
  role = 'STUDENT',
  collegeId = 'GEC',
}) => {
  const [records, setRecords] = useState<AttendanceItem[]>(INITIAL_ATTENDANCE);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAttended, setEditAttended] = useState<number>(0);
  const [editTotal, setEditTotal] = useState<number>(0);

  // New course form state for Teachers
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newTotal, setNewTotal] = useState(30);
  const [newAttended, setNewAttended] = useState(25);
  const [newStudentName, setNewStudentName] = useState('Rahul Sharma');
  const [newStudentId, setNewStudentId] = useState('2024CS001');

  const calcStatus = (percent: number, verified: boolean): 'SAFE' | 'WARNING' | 'CRITICAL' => {
    if (percent >= 75.0 || verified) return 'SAFE';
    if (percent >= 65.0) return 'WARNING';
    return 'CRITICAL';
  };

  const handleStartEdit = (item: AttendanceItem) => {
    setEditingId(item.record_id);
    setEditAttended(item.attended_classes);
    setEditTotal(item.total_classes);
  };

  const handleSaveEdit = (id: string) => {
    setRecords((prev) =>
      prev.map((rec) => {
        if (rec.record_id === id) {
          const percent = parseFloat(
            ((editAttended / Math.max(1, editTotal)) * 100).toFixed(1)
          );
          return {
            ...rec,
            attended_classes: editAttended,
            total_classes: editTotal,
            attendance_percentage: percent,
            status: calcStatus(percent, rec.medical_leave_verified),
          };
        }
        return rec;
      })
    );
    setEditingId(null);
  };

  const handleToggleMedicalVerify = (id: string) => {
    setRecords((prev) =>
      prev.map((rec) => {
        if (rec.record_id === id) {
          const newVerify = !rec.medical_leave_verified;
          return {
            ...rec,
            medical_leave_verified: newVerify,
            status: calcStatus(rec.attendance_percentage, newVerify),
          };
        }
        return rec;
      })
    );
  };

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) return;

    const percent = parseFloat(
      ((newAttended / Math.max(1, newTotal)) * 100).toFixed(1)
    );
    const newRec: AttendanceItem = {
      record_id: `att-${Date.now()}`,
      college_id: collegeId,
      student_id: newStudentId,
      student_name: newStudentName,
      course_code: newCode,
      course_name: newName,
      total_classes: newTotal,
      attended_classes: newAttended,
      attendance_percentage: percent,
      status: calcStatus(percent, false),
      medical_leave_submitted: false,
      medical_leave_verified: false,
    };

    setRecords((prev) => [newRec, ...prev]);
    setShowAddModal(false);
    setNewCode('');
    setNewName('');
  };

  const filteredRecords = records.filter((r) => r.college_id === collegeId);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 animate-fade-in space-y-8">
      {/* Top Header Banner */}
      <div className="p-6 rounded-2xl glass-panel border border-blue-500/30 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${
                role === 'TEACHER'
                  ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                  : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
              }`}
            >
              {role === 'TEACHER' ? 'Teacher / Staff Portal (Full Edit)' : 'Student Portal (View Only)'}
            </span>
            <span className="text-xs text-slate-400 font-mono">Tenant: {collegeId}</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
            <CalendarCheck className="w-7 h-7 text-blue-400" />
            <span>Campus Student Attendance & Eligibility</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {role === 'TEACHER'
              ? 'You have authority to insert/update student attendance percentages and verify medical certificates.'
              : 'View-only attendance records. Below 75% requires an approved medical certificate or ticket escalation.'}
          </p>
        </div>

        {role === 'TEACHER' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-glow-blue transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Course Attendance</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl glass-card border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Average Attendance</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">77.3%</p>
            <p className="text-[11px] text-emerald-300 mt-0.5">Above 75% Campus Threshold</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Courses Below 75%</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">1 Course</p>
            <p className="text-[11px] text-amber-300 mt-0.5">CS203 (Medical Submitted)</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Medical Certificates</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">1 Pending</p>
            <p className="text-[11px] text-blue-300 mt-0.5">
              {role === 'TEACHER' ? 'Click below to verify' : 'Waiting for faculty review'}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
            <FileText className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Add Course Modal for Teachers */}
      {showAddModal && role === 'TEACHER' && (
        <div className="p-6 rounded-2xl glass-panel border border-purple-500/30 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white text-base">Add New Course Attendance Record</h3>
            <button
              onClick={() => setShowAddModal(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
          <form onSubmit={handleAddCourse} className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Course Code</label>
              <input
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="e.g. CS205"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-slate-400 mb-1">Course Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Operating Systems"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Attended / Total</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={newAttended}
                  onChange={(e) => setNewAttended(parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-center"
                />
                <span className="text-slate-400">/</span>
                <input
                  type="number"
                  value={newTotal}
                  onChange={(e) => setNewTotal(parseInt(e.target.value) || 1)}
                  className="w-16 px-2 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-center"
                />
              </div>
            </div>
            <div className="sm:col-span-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-glow-blue"
              >
                Insert Record
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Course Attendance Table */}
      <div className="overflow-x-auto rounded-2xl glass-card border border-white/10">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-xs text-slate-400 font-semibold bg-slate-900/50">
              <th className="py-3.5 px-4">Course & Student</th>
              <th className="py-3.5 px-4">Classes Attended / Total</th>
              <th className="py-3.5 px-4">Attendance %</th>
              <th className="py-3.5 px-4">Medical Leave Status</th>
              <th className="py-3.5 px-4">Eligibility</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm text-slate-200">
            {filteredRecords.map((item) => (
              <tr key={item.record_id} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-4 px-4">
                  <div className="font-semibold text-white flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-blue-400 text-xs font-mono">
                      {item.course_code}
                    </span>
                    <span>{item.course_name}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {item.student_name} ({item.student_id})
                  </div>
                </td>

                <td className="py-4 px-4">
                  {editingId === item.record_id && role === 'TEACHER' ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={editAttended}
                        onChange={(e) => setEditAttended(parseInt(e.target.value) || 0)}
                        className="w-14 px-2 py-1 rounded bg-slate-900 border border-purple-500 text-xs text-white text-center"
                      />
                      <span className="text-slate-400">/</span>
                      <input
                        type="number"
                        value={editTotal}
                        onChange={(e) => setEditTotal(parseInt(e.target.value) || 1)}
                        className="w-14 px-2 py-1 rounded bg-slate-900 border border-purple-500 text-xs text-white text-center"
                      />
                    </div>
                  ) : (
                    <span className="font-mono text-slate-300">
                      {item.attended_classes} / {item.total_classes}
                    </span>
                  )}
                </td>

                <td className="py-4 px-4">
                  <span
                    className={`font-bold ${
                      item.attendance_percentage >= 75
                        ? 'text-emerald-400'
                        : item.attendance_percentage >= 65
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {item.attendance_percentage}%
                  </span>
                </td>

                <td className="py-4 px-4 text-xs">
                  {item.medical_leave_submitted ? (
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          item.medical_leave_verified
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {item.medical_leave_verified ? 'Verified (Approved)' : 'Pending Faculty Review'}
                      </span>
                      {role === 'TEACHER' && (
                        <button
                          onClick={() => handleToggleMedicalVerify(item.record_id)}
                          className="px-2 py-1 rounded bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 text-[10px] font-semibold border border-purple-500/30 transition-colors"
                        >
                          {item.medical_leave_verified ? 'Revoke' : 'Approve'}
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-500">No Leave Needed</span>
                  )}
                </td>

                <td className="py-4 px-4">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 w-fit ${
                      item.status === 'SAFE'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : item.status === 'WARNING'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{item.status}</span>
                  </span>
                </td>

                <td className="py-4 px-4 text-right">
                  {role === 'TEACHER' ? (
                    editingId === item.record_id ? (
                      <button
                        onClick={() => handleSaveEdit(item.record_id)}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-glow-emerald"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-400 text-xs font-semibold flex items-center gap-1.5 ml-auto"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    )
                  ) : (
                    item.attendance_percentage < 75 && (
                      <button
                        onClick={() =>
                          alert(
                            `Created Discrepancy Ticket #TICK-1003 to Academic Registrar for ${item.course_code}. Medical leave certificate attached automatically.`
                          )
                        }
                        className="px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-400 border border-blue-500/30 text-xs font-semibold transition-all"
                      >
                        Report Discrepancy
                      </button>
                    )
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
