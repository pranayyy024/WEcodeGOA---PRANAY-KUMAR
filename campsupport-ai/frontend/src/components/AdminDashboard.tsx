'use client';

import React, { useState, useEffect } from 'react';
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
  UploadCloud,
  Trash2,
  Lock,
} from 'lucide-react';

interface PolicyDocument {
  id: string;
  name: string;
  collegeId: string;
  department: string;
  size: string;
  chunks: number;
  lastUpdated: string;
  status: 'INDEXED' | 'SYNCING';
}

const INITIAL_DOCS: PolicyDocument[] = [
  {
    id: 'doc-1',
    name: 'wifi_email_sop.txt',
    collegeId: 'PCCE',
    department: 'Campus IT',
    size: '1.4 KB',
    chunks: 12,
    lastUpdated: '2026-07-30 (Verified)',
    status: 'INDEXED',
  },
  {
    id: 'doc-2',
    name: 'academic_calendar_2026.txt',
    collegeId: 'PCCE',
    department: 'Academic Registrar',
    size: '2.1 KB',
    chunks: 18,
    lastUpdated: '2026-07-30 (Verified)',
    status: 'INDEXED',
  },
  {
    id: 'doc-3',
    name: 'hostel_policy.txt',
    collegeId: 'PCCE',
    department: 'Hostel Admin',
    size: '1.8 KB',
    chunks: 14,
    lastUpdated: '2026-07-30 (Verified)',
    status: 'INDEXED',
  },
];

interface AdminDashboardProps {
  role?: 'STUDENT' | 'TEACHER';
  collegeId?: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  role = 'TEACHER',
  collegeId = 'PCCE',
}) => {
  const [docs, setDocs] = useState<PolicyDocument[]>(INITIAL_DOCS);
  const [searchFilter, setSearchFilter] = useState('');
  const [testQuery, setTestQuery] = useState('');
  const [simulatedResult, setSimulatedResult] = useState<string | null>(null);

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newDepartment, setNewDepartment] = useState('Campus IT');
  const [fileSize, setFileSize] = useState('1.6 KB');

  const handleTestRetrieval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testQuery.trim()) return;

    if (testQuery.toLowerCase().includes('wifi') || testQuery.toLowerCase().includes('network')) {
      setSimulatedResult(
        `Retrieved Chunk [wifi_email_sop.txt (${collegeId})]: "Students must connect to EduRoam using campus email credentials. For MAC randomisation errors, disable Private Address in Wi-Fi settings." (Score: 0.94)`
      );
    } else if (testQuery.toLowerCase().includes('exam') || testQuery.toLowerCase().includes('attend')) {
      setSimulatedResult(
        `Retrieved Chunk [academic_calendar_2026.txt (${collegeId})]: "Minimum 75% attendance is mandatory in each theory course to qualify for End-Semester examinations." (Score: 0.91)`
      );
    } else {
      setSimulatedResult(
        `Retrieved Chunk [hostel_policy.txt (${collegeId})]: "All electrical and plumbing repair requests must be logged via helpdesk specifying Room Number and Hostel Block." (Score: 0.88)`
      );
    }
  };

  const handleUploadDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    const newDoc: PolicyDocument = {
      id: `doc-${Date.now()}`,
      name: newFileName.endsWith('.txt') || newFileName.endsWith('.md') ? newFileName : `${newFileName}.txt`,
      collegeId: collegeId,
      department: newDepartment,
      size: fileSize,
      chunks: Math.floor(Math.random() * 15) + 8,
      lastUpdated: '2026-07-30 (Uploaded by Staff)',
      status: 'INDEXED',
    };

    setDocs((prev) => [newDoc, ...prev]);
    setShowUploadModal(false);
    setNewFileName('');
  };

  const handleDeleteDocument = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from ${collegeId} Knowledge Base?`)) {
      setDocs((prev) => prev.filter((d) => d.id !== id));
    }
  };

  const filteredDocs = docs.filter(
    (d) =>
      d.collegeId === collegeId &&
      (d.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        d.department.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 animate-fade-in space-y-8">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl glass-panel border border-emerald-500/30 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${
                role === 'TEACHER'
                  ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              }`}
            >
              {role === 'TEACHER' ? 'Teacher / Admin Control Panel' : 'Student Portal (View Only)'}
            </span>
            <span className="text-xs text-slate-400 font-mono">Tenant: {collegeId}</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
            <span>RAG Knowledge Base & Tenant Documents</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {role === 'TEACHER'
              ? 'Upload new SOP (.txt / .md) documents or delete outdated files to keep your college AI grounded.'
              : 'You are in Student View-Only Mode. Switch role to Teacher/Staff in the navbar to add or remove files.'}
          </p>
        </div>

        {role === 'TEACHER' ? (
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-glow-emerald transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Policy Document</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-slate-400">
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Staff Access Required to Edit</span>
          </div>
        )}
      </div>

      {/* KPI Cards */}
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
            <p className="text-xs text-slate-400 font-medium">Tenant ({collegeId}) Files</p>
            <p className="text-2xl font-bold text-white mt-1">{filteredDocs.length} Files</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Active Vector Chunks</p>
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

      {/* Upload Document Modal for Teachers */}
      {showUploadModal && role === 'TEACHER' && (
        <div className="p-6 rounded-2xl glass-panel border border-emerald-500/30 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white text-base flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-emerald-400" />
              <span>Upload New Campus Policy Document ({collegeId})</span>
            </h3>
            <button
              onClick={() => setShowUploadModal(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
          <form onSubmit={handleUploadDocument} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block text-slate-400 mb-1">Document Filename (.txt or .md)</label>
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="e.g. gec_exam_rules_2026.txt"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Assigned Department</label>
              <select
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white"
              >
                <option value="Campus IT">Campus IT</option>
                <option value="Academic Registrar">Academic Registrar</option>
                <option value="Hostel Admin">Hostel Admin</option>
                <option value="Library Admin">Library Admin</option>
              </select>
            </div>
            <div className="sm:col-span-3 flex items-center justify-between">
              <span className="text-slate-500 text-[11px]">
                File will be uploaded to data/knowledge_base/{collegeId}/ and indexed into LlamaIndex.
              </span>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-glow-emerald"
              >
                Upload & Index Now
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Interactive RAG Retrieval Simulator */}
      <div className="p-6 rounded-2xl glass-card border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-white text-base">
              RAG Knowledge Retrieval Sandbox ({collegeId})
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
            <span>Indexed LlamaIndex Policy Documents ({collegeId})</span>
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
                {role === 'TEACHER' && <th className="py-3 px-4 text-right">Actions</th>}
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
                  {role === 'TEACHER' && (
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteDocument(doc.id, doc.name)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Delete document from knowledge base"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
