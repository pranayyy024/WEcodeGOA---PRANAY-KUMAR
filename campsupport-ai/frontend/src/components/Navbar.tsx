'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bot,
  Ticket,
  Sliders,
  CalendarCheck,
  Building2,
  UserCheck,
  GraduationCap,
  Lock,
  LogOut,
  User,
  ShieldAlert,
} from 'lucide-react';
import { Staff2FAModal } from './Staff2FAModal';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<'STUDENT' | 'TEACHER' | 'ADMIN'>('STUDENT');
  const [college, setCollege] = useState<'GEC' | 'BITS_PILANI' | 'IIT_BOMBAY'>('GEC');
  const [show2FA, setShow2FA] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const loadSession = () => {
      const savedRole = localStorage.getItem('campsupport_role') as any;
      const savedCollege = localStorage.getItem('campsupport_college') as any;
      const savedUser = localStorage.getItem('campsupport_user');

      if (savedRole) setRole(savedRole);
      if (savedCollege) setCollege(savedCollege);
      if (savedUser) {
        try {
          setUserProfile(JSON.parse(savedUser));
        } catch (e) {
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
    };

    loadSession();

    window.addEventListener('storage', loadSession);
    window.addEventListener('role_college_changed', loadSession);

    return () => {
      window.removeEventListener('storage', loadSession);
      window.removeEventListener('role_college_changed', loadSession);
    };
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

  const handleLogout = () => {
    localStorage.removeItem('campsupport_user');
    localStorage.removeItem('campsupport_role');
    setUserProfile(null);
    setRole('STUDENT');
    router.push('/login');
  };

  const isChat = pathname === '/';
  const isTickets = pathname?.startsWith('/tickets');
  const isAttendance = pathname?.startsWith('/attendance');
  const isAdmin = pathname?.startsWith('/admin');
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return null; // Hide main navbar on Login Landing Page
  }

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
                    Multi-Role Auth
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  Goa Engineering College (GEC)
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

          {/* User Profile & Tenant Switcher */}
          <div className="flex items-center gap-2.5 flex-wrap justify-center">
            {/* College Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs font-medium text-slate-300">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-white text-xs font-semibold">GEC Campus</span>
            </div>

            {/* Logged in User Profile Badge */}
            {userProfile && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-xs">
                {userProfile.role === 'TEACHER' ? (
                  <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                ) : userProfile.role === 'ADMIN' ? (
                  <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
                ) : (
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span className="text-white font-semibold truncate max-w-[120px]">
                  {userProfile.name}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-bold text-slate-300">
                  {userProfile.role}
                </span>
              </div>
            )}

            {/* Role Switch Button with 2FA Protection */}
            <button
              onClick={handleToggleRoleClick}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                role === 'TEACHER' || role === 'ADMIN'
                  ? 'bg-purple-600/20 text-purple-300 border-purple-500/40 hover:bg-purple-600/30 shadow-glow-blue'
                  : 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-600/30'
              }`}
              title="Students require 2FA verification to access Staff Mode"
            >
              {role === 'TEACHER' || role === 'ADMIN' ? (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>👨‍🏫 Staff Edit Mode</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>🎓 Student Mode</span>
                </>
              )}
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-rose-950/50 border border-white/10 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 transition-all"
              title="Log Out of Campus Portal"
            >
              <LogOut className="w-4 h-4" />
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
