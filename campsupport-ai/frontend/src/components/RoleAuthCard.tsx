'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff, Shield, GraduationCap, Briefcase } from 'lucide-react';

interface RoleAuthCardProps {
  role: 'student' | 'faculty' | 'admin';
  title: string;
  idLabel: string;
  idPlaceholder: string;
  allowRegister?: boolean;
  defaultId?: string;
  defaultPassword?: string;
  dashboardPath: string;
}

export function RoleAuthCard({
  role,
  title,
  idLabel,
  idPlaceholder,
  allowRegister = true,
  defaultId = '',
  defaultPassword = 'password123',
  dashboardPath,
}: RoleAuthCardProps) {
  const router = useRouter();
  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sign In Form State
  const [userId, setUserId] = useState(defaultId);
  const [password, setPassword] = useState(defaultPassword);

  // Register Form State
  const [fullName, setFullName] = useState('');
  const [regId, setRegId] = useState('');
  const [deptOrBranch, setDeptOrBranch] = useState('');
  const [year, setYear] = useState('1');
  const [email, setEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const getRoleIcon = () => {
    if (role === 'student') return <GraduationCap className="w-6 h-6 text-white" />;
    if (role === 'faculty') return <Briefcase className="w-6 h-6 text-white" />;
    return <Shield className="w-6 h-6 text-white" />;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Set user session in localStorage
      const userData = {
        id: userId || `${role}-demo-101`,
        role: role,
        name: userId === 'admin@pcce.ac.in' || userId === 'ADMIN001' ? 'Dr. Ramesh Kumar (Admin)' :
              userId === '2024CS001' ? 'Rahul Sharma' :
              userId === 'FAC101' ? 'Prof. Anjali Desai' : userId,
        email: userId.includes('@') ? userId : `${userId.toLowerCase()}@pcce.ac.in`,
        department: role === 'student' ? 'Computer Science' : role === 'faculty' ? 'Information Technology' : 'Campus Admin',
      };
      localStorage.setItem('campsupport_user', JSON.stringify(userData));
      localStorage.setItem('campsupport_role', role);

      router.push(dashboardPath);
    } catch (err: any) {
      setError('Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const userData = {
        id: regId,
        role: role,
        name: fullName || 'New Campus Member',
        email: email || `${regId.toLowerCase()}@pcce.ac.in`,
        department: deptOrBranch || 'General Department',
      };
      localStorage.setItem('campsupport_user', JSON.stringify(userData));
      localStorage.setItem('campsupport_role', role);

      router.push(dashboardPath);
    } catch (err: any) {
      setError('Registration error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-[#111827] flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md">
        {/* Back link */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center space-x-2 text-sm text-[#6B7280] hover:text-[#111827] mb-8 font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {/* Header Icon + Role Title */}
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#7C3AED] flex items-center justify-center shadow-sm">
            {getRoleIcon()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">{title} Login</h1>
            <p className="text-sm text-[#6B7280]">Campus Support</p>
          </div>
        </div>

        {/* Centered White Institutional Auth Card */}
        <div className="institutional-card p-8 bg-white shadow-sm">
          {/* Tabs for Sign In | Create Account */}
          {allowRegister && (
            <div className="grid grid-cols-2 gap-2 bg-[#F3F4F6] p-1 rounded-lg mb-6">
              <button
                type="button"
                onClick={() => { setTab('signin'); setError(null); }}
                className={`py-2 text-sm font-medium rounded-md transition ${
                  tab === 'signin'
                    ? 'bg-white text-[#111827] shadow-sm'
                    : 'text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setTab('register'); setError(null); }}
                className={`py-2 text-sm font-medium rounded-md transition ${
                  tab === 'register'
                    ? 'bg-white text-[#111827] shadow-sm'
                    : 'text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 text-xs bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          {tab === 'signin' ? (
            /* Sign In Form */
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wider mb-1">
                  {idLabel}
                </label>
                <input
                  type="text"
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder={idPlaceholder}
                  className="w-full institutional-input px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full institutional-input px-3.5 py-2.5 text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#111827]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <a
                  href="#forgot"
                  onClick={(e) => { e.preventDefault(); alert('Please contact Campus IT support at it-support@pcce.ac.in to reset your password.'); }}
                  className="text-xs font-medium text-[#7C3AED] hover:text-[#6D28D9]"
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full institutional-btn py-3 text-sm font-semibold shadow-sm mt-2"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          ) : (
            /* Create Account Form */
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full institutional-input px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wider mb-1">
                    {idLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={regId}
                    onChange={(e) => setRegId(e.target.value)}
                    placeholder={idPlaceholder}
                    className="w-full institutional-input px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wider mb-1">
                    {role === 'student' ? 'Branch' : 'Department'}
                  </label>
                  <input
                    type="text"
                    required
                    value={deptOrBranch}
                    onChange={(e) => setDeptOrBranch(e.target.value)}
                    placeholder={role === 'student' ? 'e.g. CSE' : 'e.g. IT Support'}
                    className="w-full institutional-input px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {role === 'student' && (
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wider mb-1">
                    Year of Study
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full institutional-input px-3 py-2 text-sm"
                  >
                    <option value="1">First Year (FY)</option>
                    <option value="2">Second Year (SY)</option>
                    <option value="3">Third Year (TY)</option>
                    <option value="4">Final Year (BE)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wider mb-1">
                  Institutional Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. name@pcce.ac.in"
                  className="w-full institutional-input px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create password"
                    className="w-full institutional-input px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wider mb-1">
                    Confirm
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm"
                    className="w-full institutional-input px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full institutional-btn py-3 text-sm font-semibold shadow-sm mt-4"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
