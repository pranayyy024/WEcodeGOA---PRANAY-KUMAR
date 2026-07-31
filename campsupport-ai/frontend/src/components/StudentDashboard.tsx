'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, MessageSquare, Ticket, ChevronRight,
  User, Settings, LogOut, ArrowLeft, AlertCircle,
  Loader2, CheckCircle2, Clock,
} from 'lucide-react';

interface RecentTicket {
  id: string;
  title: string;
  department: string;
  status: string;
  statusColor: string;
  time: string;
}

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min${mins !== 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-red-50 text-red-600 border border-red-200',
  IN_PROGRESS: 'bg-blue-50 text-blue-600 border border-blue-200',
  RESOLVED: 'bg-green-50 text-green-600 border border-green-200',
  CLOSED: 'bg-gray-100 text-gray-500 border border-gray-200',
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

export function StudentDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState('Rahul Sharma');
  const [userInitials, setUserInitials] = useState('RS');
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentTickets, setRecentTickets] = useState<RecentTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('campsupport_user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.name) {
          setUserName(u.name);
          const parts = u.name.split(' ');
          setUserInitials(parts.map((p: string) => p[0]).join('').slice(0, 2).toUpperCase());
        }
      } catch (e) {
        // use default
      }
    }
  }, []);

  const fetchRecentTickets = useCallback(async () => {
    setTicketsLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/tickets?user_id=stud-1001');
      if (res.ok) {
        const data = await res.json();
        const mapped: RecentTicket[] = data.slice(0, 3).map((t: any) => ({
          id: t.ticket_id,
          title: t.title,
          department: t.department,
          status: STATUS_LABELS[t.status] ?? t.status,
          statusColor: STATUS_COLORS[t.status] ?? STATUS_COLORS.OPEN,
          time: timeAgo(t.created_at),
        }));
        setRecentTickets(mapped);
      }
    } catch {
      // backend not running — show nothing
      setRecentTickets([]);
    } finally {
      setTicketsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentTickets();
  }, [fetchRecentTickets]);

  // Re-fetch tickets when window regains focus (user returns from /student/tickets)
  useEffect(() => {
    const onFocus = () => fetchRecentTickets();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetchRecentTickets]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/chat?q=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push('/chat');
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('campsupport_user');
    localStorage.removeItem('campsupport_role');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-[#111827] flex flex-col font-sans">
      {/* Institutional Top Navbar */}
      <header className="w-full border-b border-[#E5E7EB] bg-white px-6 py-4 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Left: Back to College Portal & Brand */}
          <div className="flex items-center space-x-6">
            <button
              onClick={() => alert('Returning to main college ERP portal...')}
              className="flex items-center space-x-2 text-sm text-[#6B7280] hover:text-[#111827] font-medium transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to College Portal</span>
            </button>
            <div className="h-5 w-[1px] bg-[#E5E7EB] hidden sm:block" />
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#7C3AED] flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">CS</span>
              </div>
              <div>
                <div className="font-bold text-base text-[#111827] leading-tight">CampSupport AI</div>
                <div className="text-[11px] text-[#6B7280]">Student Portal</div>
              </div>
            </div>
          </div>

          {/* Right: Nav Links + Profile */}
          <div className="flex items-center space-x-6">
            <button
              onClick={() => router.push('/chat')}
              className="hidden sm:flex items-center space-x-1.5 text-sm font-medium text-[#6B7280] hover:text-[#7C3AED] transition"
            >
              <MessageSquare className="w-4 h-4" />
              <span>AI Helpdesk</span>
            </button>
            <button
              onClick={() => router.push('/student/tickets')}
              className="hidden sm:flex items-center space-x-1.5 text-sm font-medium text-[#6B7280] hover:text-[#7C3AED] transition"
            >
              <Ticket className="w-4 h-4" />
              <span>My Tickets</span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-[#E5E7EB] bg-white hover:border-[#7C3AED] transition"
              >
                <div className="w-7 h-7 rounded-lg bg-[#7C3AED] flex items-center justify-center text-white text-xs font-bold">
                  {userInitials}
                </div>
                <span className="text-sm font-medium text-[#374151] hidden sm:inline">{userName}</span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-50 py-1">
                  <div className="px-4 py-2 border-b border-[#E5E7EB]">
                    <p className="text-xs font-semibold text-[#111827]">{userName}</p>
                    <p className="text-[10px] text-[#6B7280]">Student • PCCE</p>
                  </div>
                  <button className="w-full text-left px-4 py-2 text-sm text-[#374151] hover:bg-[#FAFAFC] flex items-center space-x-2">
                    <User className="w-4 h-4 text-[#6B7280]" />
                    <span>Profile</span>
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-[#374151] hover:bg-[#FAFAFC] flex items-center space-x-2">
                    <Settings className="w-4 h-4 text-[#6B7280]" />
                    <span>Settings</span>
                  </button>
                  <div className="border-t border-[#E5E7EB] my-1" />
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#111827] mb-2">
            Welcome back, {userName.split(' ')[0]}
          </h1>
          <p className="text-base text-[#6B7280]">
            How can we help you today?
          </p>
        </div>

        {/* Large AI Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mb-10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ask anything about campus services, policies, or submit a ticket..."
              className="w-full bg-white border border-[#E5E7EB] rounded-xl pl-12 pr-4 py-4 text-sm sm:text-base text-[#111827] placeholder-[#9CA3AF] shadow-sm focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/15 transition"
            />
          </div>
        </form>

        {/* Quick Actions (Two Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Start AI Chat */}
          <div
            onClick={() => router.push('/chat')}
            className="institutional-card institutional-card-hover p-6 flex items-start space-x-4 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-[#7C3AED] flex-shrink-0 flex items-center justify-center shadow-sm">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#111827] mb-1">
                Start AI Chat
              </h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                Get instant answers powered by AI, backed by official campus documents
              </p>
            </div>
          </div>

          {/* My Tickets */}
          <div
            onClick={() => router.push('/student/tickets')}
            className="institutional-card institutional-card-hover p-6 flex items-start space-x-4 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-[#14B8A6] flex-shrink-0 flex items-center justify-center shadow-sm">
              <Ticket className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#111827] mb-1">
                My Tickets
              </h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                Track all your support requests and their current status
              </p>
            </div>
          </div>
        </div>

        {/* Recent Tickets Section */}
        <div className="institutional-card p-6 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#111827]">
              Recent Tickets
            </h2>
            <button
              onClick={() => router.push('/student/tickets')}
              className="text-sm font-semibold text-[#7C3AED] hover:text-[#6D28D9] flex items-center space-x-1"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {ticketsLoading ? (
            <div className="flex items-center justify-center py-8 space-x-2 text-[#6B7280]">
              <Loader2 className="w-5 h-5 animate-spin text-[#7C3AED]" />
              <span className="text-sm">Loading your tickets...</span>
            </div>
          ) : recentTickets.length === 0 ? (
            <div className="text-center py-8">
              <Ticket className="w-8 h-8 text-[#D1D5DB] mx-auto mb-2" />
              <p className="text-sm text-[#6B7280]">No tickets yet.</p>
              <p className="text-xs text-[#9CA3AF] mt-1">
                Use the AI Helpdesk above or go to{' '}
                <button
                  onClick={() => router.push('/student/tickets')}
                  className="text-[#7C3AED] hover:underline font-medium"
                >
                  My Tickets
                </button>{' '}
                to raise one.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#E5E7EB]">
              {recentTickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => router.push('/student/tickets')}
                  className="py-4 first:pt-0 last:pb-0 flex items-center justify-between cursor-pointer hover:bg-[#F9FAFB] -mx-4 px-4 rounded-lg transition"
                >
                  <div>
                    <div className="flex items-center space-x-3 mb-1">
                      <span className="text-xs font-bold text-[#7C3AED]">{t.id}</span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${t.statusColor}`}>
                        {t.status}
                      </span>
                    </div>
                    <h4 className="text-base font-semibold text-[#111827] mb-0.5">
                      {t.title}
                    </h4>
                    <p className="text-xs text-[#6B7280]">
                      {t.department}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 text-right">
                    <span className="text-xs text-[#6B7280]">{t.time}</span>
                    <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
