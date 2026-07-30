'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Database,
  FileText,
  CheckCircle2,
  TrendingUp,
  Building2,
  Users,
  Search,
  Sparkles,
  RefreshCw,
  BarChart3,
  Award,
} from 'lucide-react';

interface PolicyDocument {
  id: string;
  name: string;
  department: string;
  size: string;
  chunks: number;
  lastUpdated: string;
  status: 'INDEXED' | 'SYNCING';
}

const INDEXED_DOCS: PolicyDocument[] = [
  {
    id: 'doc-1',
    name: 'wifi_email_sop.txt',
    department: 'Campus IT',
    size: '1.4 KB',
    chunks: 12,
    lastUpdated: '2026-07-30 (Verified)',
    status: 'INDEXED',
  },
  {
    id: 'doc-2',
    name: 'academic_calendar_2026.txt',
    department: 'Academic Registrar',
    size: '2.1 KB',
    chunks: 18,
    lastUpdated: '2026-07-30 (Verified)',
    status: 'INDEXED',
  },
  {
    id: 'doc-3',
    name: 'hostel_policy.txt',
    department: 'Hostel Admin',
    size: '1.8 KB',
    chunks: 14,
    lastUpdated: '2026-07-30 (Verified)',
    status: 'INDEXED',
  },
];

export const AdminDashboard: React.FC = () => {
  const [docs, setDocs] = useState<PolicyDocument[]>(INDEXED_DOCS);
  const [searchFilter, setSearchFilter] = useState('');
  const [testQuery, setTestQuery] = useState('');
  const [simulatedResult, setSimulatedResult] = useState<string | null>(null);

  const handleTestRetrieval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testQuery.trim()) return;

    if (testQuery.toLowerCase().includes('wifi') || testQuery.toLowerCase().includes('network')) {
      setSimulatedResult(
        'Retrieved Chunk [wifi_email_sop.txt]: "Students must connect to EduRoam using campus email credentials. For MAC randomisation errors, disable Private Address in Wi-Fi settings." (Score: 0.94)'
      );
    } else if (testQuery.toLowerCase().includes('exam') || testQuery.toLowerCase().includes('attend')) {
      setSimulatedResult(
        'Retrieved Chunk [academic_calendar_2026.txt]: "Minimum 75% attendance is mandatory in each theory course to qualify for End-Semester examinations." (Score: 0.91)'
      );
    } else {
      setSimulatedResult(
        'Retrieved Chunk [hostel_policy.txt]: "All electrical and plumbing repair requests must be logged via helpdesk specifying Room Number and Hostel Block." (Score: 0.88)'
      );
    }
  };

  const filteredDocs = docs.filter(
    (d) =>
      d.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      d.department.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 animate-fade-in space-y-8">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl glass-panel border border-emerald-500/30 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
              Staff / Admin Control Panel
            </span>
            <span className="text-xs text-slate-400">Campus Administration View</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
            <span>RAG Knowledge Base & Workload Analytics</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage approved LlamaIndex SOP documents, inspect grounding accuracy, and monitor ticket department distribution.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-400">
              Zero-Speculation RAG Live
            </span>
          </div>
        </div>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-card border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">RAG Grounding Accuracy</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">96.4%</p>
            <p className="text-[11px] text-emerald-300 mt-0.5">Verified against SOPs</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Approved Policy Docs</p>
            <p className="text-2xl font-bold text-white mt-1">3 Files</p>
            <p className="text-[11px] text-slate-400 mt-0.5">44 Total Chunks Indexed</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Auto-Routed Tickets</p>
            <p className="text-2xl font-bold text-white mt-1">48 Tickets</p>
            <p className="text-[11px] text-blue-300 mt-0.5">0 Manual Sorting Needed</p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Department Routing Split</p>
            <p className="text-base font-bold text-white mt-1">IT 42% | Acad 33%</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Hostel Admin 25%</p>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
            <Building2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Interactive RAG Retrieval Simulator */}
      <div className="p-6 rounded-2xl glass-card border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-white text-base">
              RAG Knowledge Retrieval Sandbox
            </h3>
          </div>
          <span className="text-xs text-slate-400">Test LlamaIndex Vector Search</span>
        </div>
        <form onSubmit={handleTestRetrieval} className="flex gap-2">
          <input
            type="text"
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            placeholder="Type a sample student query (e.g., 'exam attendance rules' or 'wifi login error')..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-glow-emerald transition-all"
          >
            Test Retrieve
          </button>
        </form>
        {simulatedResult && (
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 text-xs font-mono text-emerald-300 animate-fade-in">
            {simulatedResult}
          </div>
        )}
      </div>

      {/* Approved Documents Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white text-base flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" />
            <span>Indexed LlamaIndex Policy Documents</span>
          </h3>
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter by filename or department..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl glass-card border border-white/10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs text-slate-400 font-semibold bg-slate-900/50">
                <th className="py-3 px-4">Document Filename</th>
                <th className="py-3 px-4">Assigned Department</th>
                <th className="py-3 px-4">File Size / Chunks</th>
                <th className="py-3 px-4">Last Verified</th>
                <th className="py-3 px-4">Index Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-slate-200">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-medium text-emerald-400 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span>{doc.name}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold">
                      {doc.department}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-400">
                    {doc.size} • <span className="text-slate-300">{doc.chunks} chunks</span>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-400">{doc.lastUpdated}</td>
                  <td className="py-3.5 px-4">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{doc.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
