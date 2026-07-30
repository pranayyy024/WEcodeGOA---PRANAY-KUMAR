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
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

type AuthRole = 'STUDENT' | 'TEACHER' | 'ADMIN';
type AuthMode = 'LOGIN' | 'SIGNUP';

export const LoginPage: React.FC = () => {
  const router = useRouter();
  const [role, setRole] = useState<AuthRole>('STUDENT');
  const [mode, setMode] = useState<AuthMode>('LOGIN');

  // Form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rollNo, setRollNo] = useState('2024CS001');
  const [className, setClassName] = useState('SE-CS');
  const [department, setDepartment] = useState('Computer Science');
  const [teacherId, setTeacherId] = useState('FAC-101');
  const [adminId, setAdminId] = useState('ADM-001');

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDemoFill = (targetRole: AuthRole) => {
    setRole(targetRole);
    setMode('LOGIN');
    if (targetRole === 'STUDENT') {
      setEmail('student@gec.ac.in');
      setPassword('pass123');
    } else if (targetRole === 'TEACHER') {
      setEmail('teacher@gec.ac.in');
      setPassword('pass123');
    } else {
      setEmail('admin@gec.ac.in');
      setPassword('pass123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Build credentials object based on role
      const endpoint = mode === 'LOGIN' ? '/api/v1/auth/login' : `/api/v1/auth/signup/${role.toLowerCase()}`;
      const payload: any = { role, email, password };

      if (mode === 'SIGNUP') {
        payload.name = name;
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
      }

      let userData: any = null;

      try {
        const res = await fetch(`http://localhost:8000${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          userData = await res.json();
        } else {
          const errData = await res.json();
          throw new Error(errData.detail || 'Authentication failed against database.');
        }
      } catch (apiErr: any) {
        // Fallback to offline demo auth if backend server isn't running yet
        if (apiErr.message.includes('Failed to fetch') || apiErr.message.includes('NetworkError')) {
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

      // Save user session and credentials in localStorage
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
            Phase 10 Portal
          </span>
        </div>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Dedicated Multi-Role Authentication. Log in or create an account to access the Campus AI Chatbot and tenant records.
        </p>
      </div>

      {/* Main Glass Card */}
      <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 shadow-2xl relative z-10 space-y-6 animate-fade-in">
        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-white/5">
          <button
            type="button"
            onClick={() => setRole('STUDENT')}
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
            onClick={() => setRole('TEACHER')}
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
            onClick={() => setRole('ADMIN')}
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

        {/* Mode Switcher (Sign In vs Sign Up) */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {mode === 'LOGIN' ? `Sign In to ${role} Portal` : `Create ${role} Account`}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {mode === 'LOGIN'
                ? `Enter your ${role.toLowerCase()} credentials to access your dedicated database.`
                : `Register new credentials in the dedicated ${role.toLowerCase()}s collection.`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'LOGIN' ? 'SIGNUP' : 'LOGIN');
              setError(null);
            }}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
          >
            {mode === 'LOGIN' ? 'Need an account? Sign Up' : 'Have an account? Sign In'}
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* SIGN UP ONLY FIELDS */}
          {mode === 'SIGNUP' && (
            <>
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">1. Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* STUDENT SIGNUP FIELDS */}
              {role === 'STUDENT' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">2. Roll No.</label>
                    <div className="relative">
                      <IdCard className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={rollNo}
                        onChange={(e) => setRollNo(e.target.value)}
                        placeholder="e.g. 2024CS001"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">3. Class</label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        placeholder="e.g. SE-CS"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STUDENT & TEACHER DEPARTMENT */}
              {(role === 'STUDENT' || role === 'TEACHER') && (
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">
                    {role === 'STUDENT' ? '4. Department' : '2. Department'}
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Computer Science"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>
              )}

              {/* TEACHER ID */}
              {role === 'TEACHER' && (
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">3. Teacher ID</label>
                  <div className="relative">
                    <IdCard className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={teacherId}
                      onChange={(e) => setTeacherId(e.target.value)}
                      placeholder="e.g. FAC-101"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>
                </div>
              )}

              {/* ADMIN ID */}
              {role === 'ADMIN' && (
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">2. Admin ID</label>
                  <div className="relative">
                    <IdCard className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={adminId}
                      onChange={(e) => setAdminId(e.target.value)}
                      placeholder="e.g. ADM-001"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* EMAIL FIELD (Common to both Login and Signup) */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              {mode === 'SIGNUP'
                ? role === 'STUDENT'
                  ? '5. College Email'
                  : role === 'TEACHER'
                  ? '4. College Email'
                  : '3. Admin Email'
                : `${role} Email Address`}
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

          {/* PASSWORD FIELD */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              {mode === 'SIGNUP'
                ? role === 'STUDENT'
                  ? '6. Password'
                  : role === 'TEACHER'
                  ? '5. Password'
                  : '4. Password'
                : 'Password'}
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
            className={`w-full py-3 rounded-xl text-white font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
              role === 'TEACHER'
                ? 'bg-purple-600 hover:bg-purple-500 shadow-glow-blue'
                : role === 'ADMIN'
                ? 'bg-blue-600 hover:bg-blue-500 shadow-glow-blue'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-glow-emerald'
            }`}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>
                  {mode === 'LOGIN' ? `Sign In to ${role} Portal` : `Create ${role} Account & Continue`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Hackathon Judge Convenience / Demo Auto-Fill */}
        <div className="pt-4 border-t border-white/10">
          <p className="text-[11px] text-slate-400 text-center mb-2 font-medium">
            💡 Hackathon Judge Demo Accounts (1-Click Fill)
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
