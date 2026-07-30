'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bot,
  GraduationCap,
  UserCheck,
  ShieldAlert,
  Lock,
  Mail,
  KeyRound,
  User,
  Building2,
  BookOpen,
  IdCard,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

type AuthRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

export const LoginPage: React.FC = () => {
  const router = useRouter();
  const [role, setRole] = useState<AuthRole>('STUDENT');

  // Form inputs for Student (6 fields), Teacher (5 fields), Admin (4 fields)
  const [name, setName] = useState('Rahul Sharma');
  const [rollNo, setRollNo] = useState('2024CS001');
  const [className, setClassName] = useState('SE-CS');
  const [department, setDepartment] = useState('Computer Science');
  const [teacherId, setTeacherId] = useState('FAC-101');
  const [adminId, setAdminId] = useState('ADM-001');
  const [email, setEmail] = useState('student@gec.ac.in');
  const [password, setPassword] = useState('pass123');

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (newRole: AuthRole) => {
    setRole(newRole);
    setError(null);
    if (newRole === 'STUDENT') {
      setName('Rahul Sharma');
      setRollNo('2024CS001');
      setClassName('SE-CS');
      setDepartment('Computer Science');
      setEmail('student@gec.ac.in');
      setPassword('pass123');
    } else if (newRole === 'TEACHER') {
      setName('Dr. Rajesh Kulkarni');
      setDepartment('Campus IT');
      setTeacherId('FAC-101');
      setEmail('teacher@gec.ac.in');
      setPassword('pass123');
    } else if (newRole === 'ADMIN') {
      setName('Prof. Anita Desai');
      setAdminId('ADM-001');
      setEmail('admin@gec.ac.in');
      setPassword('pass123');
    }
  };

  const handleDemoFill = (targetRole: AuthRole) => {
    handleRoleChange(targetRole);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload: any = { role, email, password, name };

      if (role === 'STUDENT') {
        payload.roll_no = rollNo;
        payload.class_name = className;
        payload.department = department;
        payload.college_email = email;
      } else if (role === 'TEACHER') {
        payload.teacher_id = teacherId;
        payload.department = department;
        payload.college_email = email;
      } else if (role === 'ADMIN') {
        payload.admin_id = adminId;
        payload.email = email;
      }

      let userData: any = null;

      try {
        // Try authenticating/signing up with backend server
        const res = await fetch(`http://localhost:8000/api/v1/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role, email, password }),
        });

        if (res.ok) {
          userData = await res.json();
        } else {
          // If not in DB yet, try signup endpoint
          const resSignup = await fetch(`http://localhost:8000/api/v1/auth/signup/${role.toLowerCase()}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (resSignup.ok) {
            userData = await resSignup.json();
          } else {
            const errData = await resSignup.json();
            throw new Error(errData.detail || 'Authentication failed.');
          }
        }
      } catch (apiErr: any) {
        // Fallback to offline demo auth if backend server isn't running yet
        if (apiErr.message?.includes('Failed to fetch') || apiErr.message?.includes('NetworkError')) {
          userData = {
            user_id: `${role.toLowerCase()}-demo`,
            role: role,
            name: name || (role === 'STUDENT' ? 'Rahul Sharma' : role === 'TEACHER' ? 'Dr. Rajesh Kulkarni' : 'Prof. Anita Desai'),
            email: email || `${role.toLowerCase()}@gec.ac.in`,
            department: department,
            roll_no: role === 'STUDENT' ? rollNo : undefined,
            teacher_id: role === 'TEACHER' ? teacherId : undefined,
            admin_id: role === 'ADMIN' ? adminId : undefined,
            token: 'offline-jwt-token',
          };
        } else {
          throw apiErr;
        }
      }

      // Save user session and credentials in localStorage (single college GEC)
      localStorage.setItem('campsupport_user', JSON.stringify(userData));
      localStorage.setItem('campsupport_role', userData.role);
      localStorage.setItem('campsupport_college', 'GEC');
      window.dispatchEvent(new Event('role_college_changed'));

      // Navigate to Home Page (AI Chatbot)
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Authentication error occurred. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Glow Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="text-center mb-6 space-y-2 animate-fade-in z-10">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl glass-panel border border-white/10 shadow-glow-emerald">
          <Bot className="w-6 h-6 text-emerald-400" />
          <span className="font-bold text-lg text-white tracking-tight">
            CampSupport <span className="text-gradient">AI</span>
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold uppercase">
            Goa Eng. College (GEC)
          </span>
        </div>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Single-Campus Role Authentication. Enter your verified credentials to access the AI Chatbot and Helpdesk.
        </p>
      </div>

      {/* Main Glass Card */}
      <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 shadow-2xl relative z-10 space-y-6 animate-fade-in">
        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-white/5">
          <button
            type="button"
            onClick={() => handleRoleChange('STUDENT')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              role === 'STUDENT'
                ? 'bg-emerald-600 text-white shadow-glow-emerald'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('TEACHER')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              role === 'TEACHER'
                ? 'bg-purple-600 text-white shadow-glow-blue'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Teacher</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('ADMIN')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              role === 'ADMIN'
                ? 'bg-blue-600 text-white shadow-glow-blue'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Admin</span>
          </button>
        </div>

        {/* Portal Title */}
        <div className="border-b border-white/10 pb-3">
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>{role} Credentials Database</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] text-slate-300 font-mono">
              {role === 'STUDENT' ? '6 Required Fields' : role === 'TEACHER' ? '5 Required Fields' : '4 Required Fields'}
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {role === 'STUDENT'
              ? 'Students Database: enter your name, roll no, class, department, college email, and password.'
              : role === 'TEACHER'
              ? 'Teachers Database: enter your name, department, teacher_id, college email, and password.'
              : 'Admins Database: enter your name, admin_id, email, and password.'}
          </p>
        </div>

        {/* Auth Form with ALL Requested Fields Visible */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* 1. NAME (Common to Student, Teacher, Admin) */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              {role === 'STUDENT' ? '1. name' : role === 'TEACHER' ? '1. Name' : '1. name'}
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* STUDENT SPECIFIC FIELDS (2. roll no., 3. class, 4. department) */}
          {role === 'STUDENT' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">2. roll no.</label>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={rollNo}
                      onChange={(e) => setRollNo(e.target.value)}
                      placeholder="2024CS001"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">3. class</label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      placeholder="SE-CS"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">4. department</label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Computer Science"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* TEACHER SPECIFIC FIELDS (2. department, 3. teacher_id) */}
          {role === 'TEACHER' && (
            <>
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">2. department</label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Campus IT"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">3. teacher_id</label>
                <div className="relative">
                  <IdCard className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={teacherId}
                    onChange={(e) => setTeacherId(e.target.value)}
                    placeholder="FAC-101"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* ADMIN SPECIFIC FIELDS (2. admin_id) */}
          {role === 'ADMIN' && (
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">2. admin_id</label>
              <div className="relative">
                <IdCard className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="ADM-001"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>
          )}

          {/* EMAIL FIELD (5. college email for Student, 4. college email for Teacher, 3. email for Admin) */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              {role === 'STUDENT'
                ? '5. college email'
                : role === 'TEACHER'
                ? '4. college email'
                : '3. email'}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  role === 'STUDENT'
                    ? 'student@gec.ac.in'
                    : role === 'TEACHER'
                    ? 'teacher@gec.ac.in'
                    : 'admin@gec.ac.in'
                }
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* PASSWORD FIELD (6. password for Student, 5. password for Teacher, 4. password for Admin) */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              {role === 'STUDENT'
                ? '6. password'
                : role === 'TEACHER'
                ? '5. password'
                : '4. password'}
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-xl text-white font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
              role === 'TEACHER'
                ? 'bg-purple-600 hover:bg-purple-500 shadow-glow-blue'
                : role === 'ADMIN'
                ? 'bg-blue-600 hover:bg-blue-500 shadow-glow-blue'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-glow-emerald'
            }`}
          >
            {loading ? (
              <span>Authenticating with {role} Database...</span>
            ) : (
              <>
                <span>Enter Campus AI Chatbot ({role})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Hackathon Judge Convenience / Demo Auto-Fill */}
        <div className="pt-4 border-t border-white/10">
          <p className="text-[11px] text-slate-400 text-center mb-2 font-medium">
            💡 Hackathon Judge Demo Accounts (1-Click Fill All Fields)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('STUDENT')}
              className="py-1.5 px-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300 font-semibold hover:bg-emerald-900/40 transition-colors"
            >
              Demo Student
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('TEACHER')}
              className="py-1.5 px-2 rounded-lg bg-purple-950/40 border border-purple-500/30 text-[11px] text-purple-300 font-semibold hover:bg-purple-900/40 transition-colors"
            >
              Demo Teacher
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('ADMIN')}
              className="py-1.5 px-2 rounded-lg bg-blue-950/40 border border-blue-500/30 text-[11px] text-blue-300 font-semibold hover:bg-blue-900/40 transition-colors"
            >
              Demo Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
