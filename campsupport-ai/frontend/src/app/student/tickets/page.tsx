'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Ticket,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  Search,
  Filter,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Calendar,
  Building2,
} from 'lucide-react';

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  department: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  createdAt: string;
  updatedAt: string;
  staffReply?: string;
}

const DEMO_TICKETS: SupportTicket[] = [
  {
    id: 'TKT-2024-001',
    title: 'WiFi Connection Issue in Hostel Block B',
    description:
      'Unable to connect to campus WiFi (PCCE-Student) from my hostel room. The network is visible but keeps disconnecting after a few minutes.',
    department: 'IT Support',
    priority: 'High',
    status: 'Open',
    createdAt: '2026-07-31T07:30:00Z',
    updatedAt: '2026-07-31T07:30:00Z',
    staffReply: undefined,
  },
  {
    id: 'TKT-2024-002',
    title: 'Library Fee Receipt Verification',
    description:
      'I paid my library fine of ₹120 via UPI on July 29th but it still shows as unpaid in the ERP portal. UPI ref: 2024072912345.',
    department: 'Finance & Accounts',
    priority: 'Medium',
    status: 'In Progress',
    createdAt: '2026-07-30T09:00:00Z',
    updatedAt: '2026-07-31T06:00:00Z',
    staffReply:
      'We have received your payment details and are verifying with the accounts team. This will be updated within 1 working day.',
  },
  {
    id: 'TKT-2024-003',
    title: 'ID Card Renewal Request',
    description:
      'My student ID card was damaged. Requesting a replacement. I have submitted the ₹50 fee at the admin counter (Receipt: ADM-2024-5678).',
    department: 'Academic Services',
    priority: 'Low',
    status: 'Resolved',
    createdAt: '2026-07-28T11:00:00Z',
    updatedAt: '2026-07-30T15:00:00Z',
    staffReply:
      'Your new ID card is ready for collection at the Academic Services counter (Block A, Room 101) between 9 AM – 5 PM on any working day.',
  },
];

const STATUS_CONFIG = {
  Open: {
    color: 'bg-red-50 text-red-600 border border-red-200',
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
  'In Progress': {
    color: 'bg-blue-50 text-blue-600 border border-blue-200',
    icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
  },
  Resolved: {
    color: 'bg-green-50 text-green-600 border border-green-200',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  Closed: {
    color: 'bg-gray-50 text-gray-500 border border-gray-200',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
};

const PRIORITY_CONFIG = {
  Low: 'bg-gray-100 text-gray-600',
  Medium: 'bg-yellow-50 text-yellow-700',
  High: 'bg-orange-50 text-orange-600',
  Urgent: 'bg-red-50 text-red-600',
};

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function StudentTicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDept, setNewDept] = useState('IT Support');
  const [newPriority, setNewPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/v1/tickets?user_id=stud-1001');
        if (res.ok) {
          const data = await res.json();
          // Map backend TicketStatus enum values to our display format
          const mapped: SupportTicket[] = data.map((t: any) => ({
            id: t.ticket_id,
            title: t.title,
            description: t.description,
            department: t.department,
            priority: t.priority.charAt(0) + t.priority.slice(1).toLowerCase() as any,
            status: t.status === 'IN_PROGRESS' ? 'In Progress' : 
                    t.status.charAt(0) + t.status.slice(1).toLowerCase() as any,
            createdAt: t.created_at,
            updatedAt: t.created_at,
            staffReply: t.staff_reply ?? undefined,
          }));
          setTickets(mapped);
        } else {
          setTickets(DEMO_TICKETS);
        }
      } catch {
        // Backend not running — show demo data
        setTickets(DEMO_TICKETS);
      }
    };
    loadTickets();
  }, []);

  const statuses = ['All', 'Open', 'In Progress', 'Resolved', 'Closed'];

  const filtered = tickets.filter((t) => {
    const matchStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleNewTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'stud-1001',
          title: newTitle,
          description: newDesc,
          department: newDept,
          priority: newPriority.toUpperCase(),
          category: 'GENERAL',
          metadata: {},
        }),
      });

      if (res.ok) {
        const t = await res.json();
        const newTicket: SupportTicket = {
          id: t.ticket_id,
          title: t.title,
          description: t.description,
          department: t.department,
          priority: newPriority,
          status: 'Open',
          createdAt: t.created_at,
          updatedAt: t.created_at,
          staffReply: undefined,
        };
        setTickets((prev) => [newTicket, ...prev]);
        setExpandedId(newTicket.id);
      } else {
        alert('Failed to submit ticket. Please try again.');
      }
    } catch {
      alert('Backend not reachable. Please start the backend server.');
    } finally {
      setNewTitle('');
      setNewDesc('');
      setNewDept('IT Support');
      setNewPriority('Medium');
      setShowNewTicket(false);
      setSubmitting(false);
    }
  };

  const openCount = tickets.filter((t) => t.status === 'Open').length;
  const inProgressCount = tickets.filter((t) => t.status === 'In Progress').length;
  const resolvedCount = tickets.filter((t) => t.status === 'Resolved').length;

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-[#111827] flex flex-col font-sans">
      {/* Header */}
      <header className="w-full border-b border-[#E5E7EB] bg-white px-6 py-4 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/student/dashboard')}
              className="flex items-center space-x-2 text-sm text-[#6B7280] hover:text-[#111827] font-medium transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <div className="h-5 w-[1px] bg-[#E5E7EB]" />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-[#14B8A6] flex items-center justify-center">
                <Ticket className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-[#111827]">My Support Tickets</span>
            </div>
          </div>

          <button
            onClick={() => setShowNewTicket(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-semibold transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Ticket</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Open', count: openCount, color: 'text-red-600 bg-red-50 border-red-200' },
            { label: 'In Progress', count: inProgressCount, color: 'text-blue-600 bg-blue-50 border-blue-200' },
            { label: 'Resolved', count: resolvedCount, color: 'text-green-600 bg-green-50 border-green-200' },
          ].map((s) => (
            <div
              key={s.label}
              onClick={() => setStatusFilter(s.label)}
              className={`cursor-pointer rounded-xl border p-4 text-center transition hover:shadow-sm ${s.color}`}
            >
              <div className="text-2xl font-bold">{s.count}</div>
              <div className="text-xs font-semibold mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tickets by title, ID, or department..."
              className="w-full bg-white border border-[#E5E7EB] rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/15 transition"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-[#6B7280]" />
            <div className="flex gap-1">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                    statusFilter === s
                      ? 'bg-[#7C3AED] text-white'
                      : 'bg-white border border-[#E5E7EB] text-[#374151] hover:border-[#7C3AED] hover:text-[#7C3AED]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tickets List */}
        {filtered.length === 0 ? (
          <div className="institutional-card bg-white p-12 text-center">
            <Ticket className="w-10 h-10 text-[#D1D5DB] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#374151] mb-1">No tickets found</h3>
            <p className="text-sm text-[#6B7280]">
              {statusFilter !== 'All'
                ? `No "${statusFilter}" tickets. Try changing the filter.`
                : 'You have no support tickets yet. Use the AI Helpdesk or create one directly.'}
            </p>
            <button
              onClick={() => router.push('/chat')}
              className="mt-4 inline-flex items-center space-x-2 text-sm font-semibold text-[#7C3AED] hover:text-[#6D28D9] transition"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Go to AI Helpdesk</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((ticket) => {
              const statusCfg = STATUS_CONFIG[ticket.status];
              const isExpanded = expandedId === ticket.id;
              return (
                <div
                  key={ticket.id}
                  className="institutional-card bg-white overflow-hidden"
                >
                  {/* Ticket Header Row */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : ticket.id)}
                    className="w-full text-left p-5 flex items-center justify-between hover:bg-[#FAFAFC] transition"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="text-xs font-bold text-[#7C3AED]">{ticket.id}</span>
                        <span
                          className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium ${statusCfg.color}`}
                        >
                          {statusCfg.icon}
                          {ticket.status}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded font-semibold ${PRIORITY_CONFIG[ticket.priority]}`}
                        >
                          {ticket.priority}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-semibold text-[#111827] truncate pr-4">
                        {ticket.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-[#6B7280]">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          {ticket.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDateTime(ticket.createdAt)}
                        </span>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-[#9CA3AF] flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#9CA3AF] flex-shrink-0" />
                    )}
                  </button>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="border-t border-[#E5E7EB] px-5 pb-5 pt-4 space-y-4">
                      <div>
                        <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1.5">
                          Your Request
                        </p>
                        <p className="text-sm text-[#374151] leading-relaxed bg-[#FAFAFC] rounded-lg p-3 border border-[#E5E7EB]">
                          {ticket.description}
                        </p>
                      </div>

                      {ticket.staffReply && (
                        <div>
                          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1.5">
                            Staff Response
                          </p>
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <p className="text-sm text-green-800 leading-relaxed">
                              {ticket.staffReply}
                            </p>
                          </div>
                        </div>
                      )}

                      {!ticket.staffReply && ticket.status === 'Open' && (
                        <div className="flex items-center gap-2 text-xs text-[#6B7280] bg-amber-50 border border-amber-200 rounded-lg p-3">
                          <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                          <span>
                            Awaiting response from <strong>{ticket.department}</strong>. Typical
                            response time is 1–2 working days.
                          </span>
                        </div>
                      )}

                      <div className="text-xs text-[#9CA3AF] text-right">
                        Last updated: {formatDateTime(ticket.updatedAt)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* New Ticket Modal */}
      {showNewTicket && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="institutional-card bg-white p-8 w-full max-w-lg shadow-xl">
            <h2 className="text-2xl font-bold text-[#111827] mb-1">Create Support Ticket</h2>
            <p className="text-sm text-[#6B7280] mb-6">
              Our campus staff will review and respond within 1–2 working days.
            </p>
            <form onSubmit={handleNewTicketSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wider mb-1">
                  Issue Title
                </label>
                <input
                  required
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. WiFi not working in Lab 3"
                  className="w-full institutional-input px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  required
                  rows={4}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe the issue in detail..."
                  className="w-full institutional-input px-3.5 py-2.5 text-sm resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full institutional-input px-3 py-2.5 text-sm"
                  >
                    <option>IT Support</option>
                    <option>Academic Services</option>
                    <option>Finance & Accounts</option>
                    <option>Student Services</option>
                    <option>Hostel Administration</option>
                    <option>Library</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wider mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as 'Low' | 'Medium' | 'High')}
                    className="w-full institutional-input px-3 py-2.5 text-sm"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewTicket(false)}
                  className="px-4 py-2 rounded-lg border border-[#E5E7EB] text-sm font-medium text-[#374151] hover:bg-[#F3F4F6] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="institutional-btn px-6 py-2 text-sm font-semibold shadow-sm disabled:opacity-60 flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {submitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
