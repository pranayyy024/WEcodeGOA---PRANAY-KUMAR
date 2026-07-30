'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, Ticket, ShieldCheck, Database } from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();

  const isChat = pathname === '/';
  const isTickets = pathname?.startsWith('/tickets');

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-4 sm:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Header */}
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
                RAG + LangGraph
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Source-Grounded Helpdesk & Ticket Escalation
            </p>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-2 bg-slate-900/60 p-1.5 rounded-2xl border border-white/5">
          <Link
            href="/"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
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
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              isTickets
                ? 'bg-blue-600 text-white shadow-glow-blue'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>Tickets Dashboard</span>
          </Link>
        </nav>

        {/* Status Pills */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/50 border border-emerald-500/20 text-xs font-medium text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero Speculation RAG</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-950/50 border border-blue-500/20 text-xs font-medium text-blue-400">
            <Database className="w-4 h-4" />
            <span>MongoDB Atlas Connected</span>
          </div>
        </div>
      </div>
    </header>
  );
};
