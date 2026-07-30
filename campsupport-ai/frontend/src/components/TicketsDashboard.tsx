'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Ticket,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  RefreshCw,
  Search,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { TicketCreated } from '../types/chat';
import { fetchAllTickets } from '../lib/api';

const DEFAULT_DEMO_TICKETS: TicketCreated[] = [
  {
    ticket_id: '#TICK-1001',
    title: 'Wi-Fi 802.1x EduRoam authentication failure in Block B',
    department: 'Campus IT',
    status: 'IN_PROGRESS',
  },
  {
    ticket_id: '#TICK-1002',
    title: 'Electrical repair fault in Hostel Block A room 204 light',
    department: 'Hostel Admin',
    status: 'OPEN',
  },
  {
    ticket_id: '#TICK-1003',
    title: 'Semester exam attendance verification for admit card download',
    department: 'Academic Registrar',
    status: 'RESOLVED',
  },
];

export const TicketsDashboard: React.FC = () => {
  const [tickets, setTickets] = useState<TicketCreated[]>(DEFAULT_DEMO_TICKETS);
  const [loading, setLoading] = useState(false);
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await fetchAllTickets();
      if (data && data.length > 0) {
        setTickets(data);
      }
    } catch (e) {
      console.warn('Backend tickets unreachable, displaying demo tickets.', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const departments = ['ALL', 'Campus IT', 'Academic Registrar', 'Hostel Admin'];

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchesDept = selectedDept === 'ALL' || t.department === selectedDept;
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.ticket_id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDept && matchesSearch;
    });
  }, [tickets, selectedDept, searchQuery]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>Open Ticket</span>
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-semibold">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>In Progress</span>
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Resolved</span>
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 animate-fade-in space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl glass-panel border border-white/10 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Ticket className="w-7 h-7 text-blue-400" />
            <span>Campus Helpdesk Tickets</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time tracking of AI-routed support requests across Campus IT, Academic Registrar, and Hostel Admin.
          </p>
        </div>
        <button
          onClick={loadTickets}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-glow-blue disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Tickets</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Ticket ID (#TICK-1001) or issue summary..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-card border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 transition-all"
          />
        </div>

        {/* Department Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-500 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </span>
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                selectedDept === dept
                  ? 'bg-blue-600 text-white shadow-glow-blue'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTickets.map((t, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl glass-card border border-white/10 hover:border-blue-500/40 transition-all group flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Top Row: Ticket ID & Status Badge */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="font-mono font-bold text-sm text-blue-400 group-hover:text-blue-300 transition-colors">
                  {t.ticket_id}
                </span>
                {getStatusBadge(t.status)}
              </div>

              {/* Title */}
              <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2">
                {t.title}
              </h3>
            </div>

            {/* Department Footer */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-medium">{t.department}</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                Auto-Routed
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredTickets.length === 0 && (
        <div className="p-12 text-center rounded-2xl glass-card border border-white/10 text-slate-400">
          <AlertCircle className="w-10 h-10 mx-auto mb-3 text-slate-500" />
          <p className="font-semibold text-white">No tickets match your filter criteria.</p>
          <p className="text-xs text-slate-500 mt-1">Try resetting your department filter or search term.</p>
        </div>
      )}
    </div>
  );
};
