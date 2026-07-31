'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MessageSquare, Wrench, ClipboardList, DollarSign, Calendar, Users, FileText, ChevronRight, ChevronDown, User, Settings, LogOut, ArrowLeft } from 'lucide-react';

export function FacultyDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState('Prof. Anjali Desai');
  const [userInitials, setUserInitials] = useState('AD');
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const quickActions = [
    {
      id: 'ai',
      title: 'AI Assistant',
      description: 'Instant answers to campus regulations & SOPs',
      icon: MessageSquare,
      color: 'bg-[#7C3AED]',
      action: () => router.push('/chat'),
    },
    {
      id: 'report',
      title: 'Report Infrastructure Issue',
      description: 'Report lab equipment, building, or WiFi faults',
      icon: Wrench,
      color: 'bg-[#14B8A6]',
      action: () => alert('Opening Faculty Infrastructure Reporting modal...'),
    },
    {
      id: 'requests',
      title: 'Support Requests',
      description: 'Track submitted tickets & departmental requests',
      icon: ClipboardList,
      color: 'bg-[#A78BFA]',
      action: () => router.push('/tickets'),
    },
    {
      id: 'payroll',
      title: 'Payroll Information',
      description: 'View payslips, tax docs & leave balance',
      icon: DollarSign,
      color: 'bg-[#7C3AED]',
      action: () => alert('Payroll status: Current payroll period active. Next payslip available on 31st.'),
    },
  ];

  const facultyServices = [
    { title: 'Attendance Records', icon: Calendar, subtitle: 'Student attendance & condonation' },
    { title: 'Payroll Calendar', icon: DollarSign, subtitle: '2026 academic fiscal schedule' },
    { title: 'Department Notices', icon: FileText, subtitle: 'IT & CSE department circulars' },
    { title: 'Leave Policies', icon: ClipboardList, subtitle: 'Casual, earned & academic leave' },
    { title: 'Academic Calendar', icon: Calendar, subtitle: 'Odd & even semester milestones' },
    { title: 'Staff Directory', icon: Users, subtitle: 'Contact numbers & emails' },
  ];

  const recentRequests = [
    {
      id: 'REQ-2024-101',
      title: 'Projector Display Flickering in Room 204',
      category: 'Infrastructure',
      status: 'In Progress',
      statusColor: 'bg-blue-50 text-blue-600 border border-blue-200',
      date: '3 hours ago',
    },
    {
      id: 'REQ-2024-102',
      title: 'EduRoam WiFi Authentication Timeout in Faculty Lounge',
      category: 'Campus IT',
      status: 'Open',
      statusColor: 'bg-red-50 text-red-600 border border-red-200',
      date: '1 day ago',
    },
    {
      id: 'REQ-2024-103',
      title: 'Academic Leave Approval for Conference',
      category: 'Admin Services',
      status: 'Resolved',
      statusColor: 'bg-green-50 text-green-600 border border-green-200',
      date: '4 days ago',
    },
  ];

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
          <div className="flex items-center space-x-6">
            <button
              onClick={() => alert('Returning to main college ERP portal...')}
              className="flex items-center space-x-2 text-sm text-[#6B7280] hover:text-[#111827] transition font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to College Portal</span>
            </button>
            <div className="h-5 w-[1px] bg-[#E5E7EB]" />
            <div
              onClick={() => router.push('/faculty/dashboard')}
              className="flex items-center space-x-3 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-[#7C3AED] flex items-center justify-center text-white font-bold text-xs">
                CS
              </div>
              <span className="font-bold text-lg text-[#111827]">CampSupport</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 relative">
            <button
              onClick={() => router.push('/tickets')}
              className="flex items-center space-x-2 text-sm font-medium text-[#6B7280] hover:text-[#111827] px-3 py-1.5 rounded-lg hover:bg-[#F3F4F6] transition"
            >
              <ClipboardList className="w-4 h-4 text-[#7C3AED]" />
              <span>Support Requests</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-[#F3F4F6] transition"
              >
                <div className="w-8 h-8 rounded-full bg-[#7C3AED] text-white flex items-center justify-center text-xs font-bold shadow-sm">
                  {userInitials}
                </div>
                <span className="text-sm font-medium text-[#111827] hidden sm:inline">You</span>
                <ChevronDown className="w-4 h-4 text-[#6B7280]" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E5E7EB] rounded-xl shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-[#E5E7EB]">
                    <p className="text-xs font-semibold text-[#111827]">{userName}</p>
                    <p className="text-xs text-[#6B7280]">Faculty Portal</p>
                  </div>
                  <button
                    onClick={() => { setProfileOpen(false); alert(`Faculty Profile: ${userName}`); }}
                    className="w-full text-left px-4 py-2 text-sm text-[#374151] hover:bg-[#F3F4F6] flex items-center space-x-2"
                  >
                    <User className="w-4 h-4 text-[#6B7280]" />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={() => { setProfileOpen(false); alert('Faculty Settings'); }}
                    className="w-full text-left px-4 py-2 text-sm text-[#374151] hover:bg-[#F3F4F6] flex items-center space-x-2"
                  >
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

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#111827] mb-2">
            Welcome back
          </h1>
          <p className="text-base text-[#6B7280]">
            Access campus support services and report institutional issues.
          </p>
        </div>

        {/* AI Search Box */}
        <form onSubmit={handleSearchSubmit} className="mb-10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ask CampSupport AI about campus services, policies, or SOPs..."
              className="w-full bg-white border border-[#E5E7EB] rounded-xl pl-12 pr-4 py-4 text-sm sm:text-base text-[#111827] placeholder-[#9CA3AF] shadow-sm focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/15 transition"
            />
          </div>
        </form>

        {/* 4 Quick Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {quickActions.map((item) => {
            const IconComp = item.icon;
            return (
              <div
                key={item.id}
                onClick={item.action}
                className="institutional-card institutional-card-hover p-6 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center shadow-sm mb-4`}>
                    <IconComp className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-[#111827] mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#6B7280] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Faculty Services Grid */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-[#111827] mb-4">
            Faculty Services
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {facultyServices.map((srv, idx) => {
              const SrvIcon = srv.icon;
              return (
                <div
                  key={idx}
                  onClick={() => alert(`Opening Faculty Service: ${srv.title}`)}
                  className="institutional-card institutional-card-hover p-4 flex items-center space-x-3 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#F3F4F6] flex items-center justify-center">
                    <SrvIcon className="w-5 h-5 text-[#7C3AED]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#111827]">
                      {srv.title}
                    </h4>
                    <p className="text-xs text-[#6B7280]">
                      {srv.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Requests Section */}
        <div className="institutional-card p-6 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#111827]">
              Recent Requests
            </h2>
            <button
              onClick={() => router.push('/tickets')}
              className="text-sm font-semibold text-[#7C3AED] hover:text-[#6D28D9] flex items-center space-x-1"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-[#E5E7EB]">
            {recentRequests.map((r) => (
              <div
                key={r.id}
                onClick={() => router.push('/tickets')}
                className="py-4 first:pt-0 last:pb-0 flex items-center justify-between cursor-pointer hover:bg-[#F9FAFB] -mx-4 px-4 rounded-lg transition"
              >
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <span className="text-xs font-bold text-[#7C3AED]">{r.id}</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${r.statusColor}`}>
                      {r.status}
                    </span>
                    <span className="text-xs text-[#6B7280]">• {r.category}</span>
                  </div>
                  <h4 className="text-base font-semibold text-[#111827] mb-0.5">
                    {r.title}
                  </h4>
                </div>

                <div className="flex items-center space-x-3 text-right">
                  <span className="text-xs text-[#6B7280]">{r.date}</span>
                  <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
