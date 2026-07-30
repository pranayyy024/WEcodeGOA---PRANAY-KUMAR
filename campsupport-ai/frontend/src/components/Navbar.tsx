'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, Ticket, ShieldCheck, Database, Sliders, CalendarCheck, Building2, UserCheck, GraduationCap, Lock } from 'lucide-react';
import { Staff2FAModal } from './Staff2FAModal';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [role, setRole] = useState<'STUDENT' | 'TEACHER'>('STUDENT');
  const [college, setCollege] = useState<'GEC' | 'BITS_PILANI' | 'IIT_BOMBAY'>('GEC');
  const [show2FA, setShow2FA] = useState(false);

  useEffect(() => {
    const savedRole = localStorage.getItem('campsupport_role') as 'STUDENT' | 'TEACHER';
    const savedCollege = localStorage.getItem('campsupport_college') as 'GEC' | 'BITS_PILANI' | 'IIT_BOMBAY';
    if (savedRole) setRole(savedRole);
    if (savedCollege) setCollege(savedCollege);
  }, []);

  const handleToggleRoleClick = () => {
    if (role === 'STUDENT') {
      // Require Two-Factor Authentication before entering Teacher/Staff Mode!
      setShow2FA(true);
    } else {
      // Switch back to Student View-Only Mode immediately
      setRole('STUDENT');
      localStorage.setItem('campsupport_role', 'STUDENT');
      window.dispatchEvent(new Event('role_college_changed'));
    }
  };

  const handle2FASuccess = () => {
    setShow2FA(false);
    setRole('TEACHER');
    localStorage.setItem('campsupport_role', 'TEACHER');
    window.dispatchEvent(new Event('role_college_changed'));
  };

  const handleChangeCollege = (newCollege: 'GEC' | 'BITS_PILANI' | 'IIT_BOMBAY') => {
    setCollege(newCollege);
    localStorage.setItem('campsupport_college', newCollege);
    window.dispatchEvent(new Event('role_college_changed'));
  };

  const isChat = pathname === '/';
  const isTickets = pathname?.startsWith('/tickets');
  const isAttendance = pathname?.startsWith('/attendance');
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Brand Header */}
          <div className="flex items-center justify-between w-full lg:w-auto">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-white shadow-glow-emerald transition-transform group-hover:scale-105">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-white tracking-tight">
                    CampSupport <span className="text-gradient">AI</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold tracking-wide uppercase">
                    Multi-College
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  Tenant: {college === 'GEC' ? 'Goa Engineering College' : college === 'BITS_PILANI' ? 'BITS Pilani Goa' : 'IIT Bombay'}
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-2 bg-slate-900/60 p-1.5 rounded-2xl border border-white/5 flex-wrap justify-center">
            <Link
              href="/"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isChat
                  ? 'bg-emerald-600 text-white shadow-glow-emerald'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>Helpdesk Chat</span>
            </Link>
            <Link
              href="/tickets"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isTickets
                  ? 'bg-blue-600 text-white shadow-glow-blue'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>Tickets</span>
            </Link>
            <Link
              href="/attendance"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isAttendance
                  ? 'bg-indigo-600 text-white shadow-glow-blue'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Attendance</span>
            </Link>
            <Link
              href="/admin"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isAdmin
                  ? 'bg-purple-600 text-white shadow-glow-blue'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Knowledge Base</span>
            </Link>
          </nav>

          {/* Tenant Switcher & Role Bar */}
          <div className="flex items-center gap-3">
            {/* College Dropdown */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs font-medium text-slate-300">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <select
                value={college}
                onChange={(e) => handleChangeCollege(e.target.value as any)}
                className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="GEC" className="bg-slate-900 text-white">Goa Eng. College (GEC)</option>
                <option value="BITS_PILANI" className="bg-slate-900 text-white">BITS Pilani Goa</option>
                <option value="IIT_BOMBAY" className="bg-slate-900 text-white">IIT Bombay</option>
              </select>
            </div>

            {/* Role Switch Button with 2FA Protection */}
            <button
              onClick={handleToggleRoleClick}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                role === 'TEACHER'
                  ? 'bg-purple-600/20 text-purple-300 border-purple-500/40 hover:bg-purple-600/30 shadow-glow-blue'
                  : 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-600/30'
              }`}
              title="Students require 2FA verification to access Staff Mode"
            >
              {role === 'TEACHER' ? (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>👨‍🏫 Staff Mode (Unrestricted)</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>🎓 Student View (2FA Protected)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Staff 2FA Security Modal */}
      <Staff2FAModal
        isOpen={show2FA}
        onClose={() => setShow2FA(false)}
        onSuccess={handle2FASuccess}
        collegeId={college}
      />
    </>
  );
};
