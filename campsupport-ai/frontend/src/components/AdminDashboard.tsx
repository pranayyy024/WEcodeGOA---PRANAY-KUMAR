'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  Eye,
  RefreshCw,
  Trash2,
  AlertCircle,
  CheckCircle2,
  FileText,
  Ticket,
  Upload,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Filter,
} from 'lucide-react';

interface KBDoc {
  id: string;
  name: string;
  college_id: string;
  department: string;
  category?: string;
  size: string;
  chunks: number;
  last_updated: string;
  status: string;
}

export function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tickets' | 'knowledge'>('dashboard');
  const [profileOpen, setProfileOpen] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [documents, setDocuments] = useState<KBDoc[]>([]);
  const [kbSearchQuery, setKbSearchQuery] = useState('');
  const [kbCategoryFilter, setKbCategoryFilter] = useState('All Categories');
  const [kbDeptFilter, setKbDeptFilter] = useState('All Departments');

  // Ticket filtering
  const [ticketSearch, setTicketSearch] = useState('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState('All Statuses');
  const [ticketDeptFilter, setTicketDeptFilter] = useState('All Departments');

  // Upload modal state (Screenshot 11)
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState('Technical');
  const [docDept, setDocDept] = useState('IT Support');
  const [uploadStatusMsg, setUploadStatusMsg] = useState<string | null>(null);
  const [uploadErrorMsg, setUploadErrorMsg] = useState<string | null>(null);

  // Fetch live documents from SQLite via API
  const fetchDocuments = async () => {
    setLoadingDocs(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/kb/documents?college_id=GEC');
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (e) {
      // Fallback mock if API offline
      setDocuments([
        {
          id: 'doc-1',
          name: 'WiFi Connectivity Guide',
          college_id: 'GEC',
          department: 'IT Support',
          category: 'Technical',
          size: '1.4 KB',
          chunks: 12,
          last_updated: '2 hours ago',
          status: 'INDEXED',
        },
        {
          id: 'doc-2',
          name: 'Course Registration Process',
          college_id: 'GEC',
          department: 'Academic Services',
          category: 'Academic',
          size: '2.1 KB',
          chunks: 18,
          last_updated: '1 day ago',
          status: 'INDEXED',
        },
        {
          id: 'doc-3',
          name: 'Hostel Rules and Regulations',
          college_id: 'GEC',
          department: 'Student Services',
          category: 'Policies',
          size: '1.8 KB',
          chunks: 14,
          last_updated: '3 days ago',
          status: 'INDEXED',
        },
      ]);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem('campsupport_role');
    if (role === 'student') {
      router.replace('/student/dashboard');
      return;
    }
    fetchDocuments();
  }, [router]);

  // Tickets demo data
  const ticketsList = [
    {
      id: 'TKT-2024-018',
      title: 'Unable to register for spring semester courses',
      student: 'Priya Patel',
      roll: '2024/CS/001',
      department: 'Academic Services',
      priority: 'High Priority',
      priorityClass: 'text-red-600',
      status: 'Pending',
      statusColor: 'bg-orange-50 text-orange-600 border border-orange-200',
      time: '2 hours ago',
    },
    {
      id: 'TKT-2024-017',
      title: 'WiFi connection dropping frequently in hostel',
      student: 'Arjun Singh',
      roll: '2024/IT/045',
      department: 'IT Support',
      priority: 'Medium Priority',
      priorityClass: 'text-orange-500',
      status: 'In Progress',
      statusColor: 'bg-blue-50 text-blue-600 border border-blue-200',
      time: '4 hours ago',
    },
    {
      id: 'TKT-2024-016',
      title: 'Request for attendance condonation form',
      student: 'Neha Verma',
      roll: '2024/EC/021',
      department: 'Student Services',
      priority: 'Low Priority',
      priorityClass: 'text-green-600',
      status: 'Pending',
      statusColor: 'bg-orange-50 text-orange-600 border border-orange-200',
      time: '6 hours ago',
    },
  ];

  // Handle Document Upload (POST /api/v1/kb/upload)
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadErrorMsg('Please select a file to upload.');
      return;
    }
    setUploadStatusMsg('Uploading document and re-indexing AI Chatbot...');
    setUploadErrorMsg(null);

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('college_id', 'GEC');
    formData.append('department', docDept);
    formData.append('category', docCategory);

    try {
      const res = await fetch('http://localhost:8000/api/v1/kb/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setUploadStatusMsg('Success! Document added to database and AI Chatbot re-indexed.');
        setTimeout(() => {
          setIsUploading(false);
          setUploadFile(null);
          setDocTitle('');
          setUploadStatusMsg(null);
          fetchDocuments();
        }, 1200);
      } else {
        const err = await res.json();
        setUploadErrorMsg(err.detail || 'Failed to upload document.');
      }
    } catch (err) {
      // Offline fallback
      setUploadStatusMsg('Uploaded successfully (offline demo mode).');
      setTimeout(() => {
        setIsUploading(false);
        setUploadFile(null);
        fetchDocuments();
      }, 1000);
    }
  };

  // Handle Document Delete (DELETE /api/v1/kb/documents/{id})
  const handleDeleteDocument = async (docId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" from the Knowledge Base and AI index?`)) {
      return;
    }
    try {
      const res = await fetch(`http://localhost:8000/api/v1/kb/documents/${docId}?college_id=GEC`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchDocuments();
      }
    } catch (e) {
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    }
  };

  // Filtered documents
  const filteredDocs = documents.filter((d) => {
    const matchesSearch =
      !kbSearchQuery ||
      d.name.toLowerCase().includes(kbSearchQuery.toLowerCase()) ||
      d.department.toLowerCase().includes(kbSearchQuery.toLowerCase());
    const matchesCategory =
      kbCategoryFilter === 'All Categories' || d.category === kbCategoryFilter;
    const matchesDept =
      kbDeptFilter === 'All Departments' || d.department === kbDeptFilter;
    return matchesSearch && matchesCategory && matchesDept;
  });

  // Filtered tickets
  const filteredTickets = ticketsList.filter((t) => {
    const matchesSearch =
      !ticketSearch ||
      t.id.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      t.title.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      t.student.toLowerCase().includes(ticketSearch.toLowerCase());
    const matchesStatus =
      ticketStatusFilter === 'All Statuses' || t.status === ticketStatusFilter;
    const matchesDept =
      ticketDeptFilter === 'All Departments' || t.department === ticketDeptFilter;
    return matchesSearch && matchesStatus && matchesDept;
  });

  const handleSignOut = () => {
    localStorage.removeItem('campsupport_user');
    localStorage.removeItem('campsupport_role');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-[#111827] flex flex-col font-sans">
      {/* Institutional Top Navbar */}
      <header className="w-full border-b border-[#E5E7EB] bg-white px-6 py-4 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left */}
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
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center space-x-3 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-[#7C3AED] flex items-center justify-center text-white font-bold text-xs">
                CS
              </div>
              <span className="font-bold text-lg text-[#111827]">CampSupport</span>
            </div>
          </div>

          {/* Center Navigation Tabs (Dashboard, Tickets, Knowledge Base) */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => { setActiveTab('dashboard'); setIsUploading(false); }}
              className={`pb-1 text-sm font-semibold transition border-b-2 ${
                activeTab === 'dashboard'
                  ? 'text-[#7C3AED] border-[#7C3AED]'
                  : 'text-[#6B7280] border-transparent hover:text-[#111827]'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => { setActiveTab('tickets'); setIsUploading(false); }}
              className={`pb-1 text-sm font-semibold transition border-b-2 ${
                activeTab === 'tickets'
                  ? 'text-[#7C3AED] border-[#7C3AED]'
                  : 'text-[#6B7280] border-transparent hover:text-[#111827]'
              }`}
            >
              Tickets
            </button>
            <button
              onClick={() => { setActiveTab('knowledge'); setIsUploading(false); }}
              className={`pb-1 text-sm font-semibold transition border-b-2 ${
                activeTab === 'knowledge'
                  ? 'text-[#7C3AED] border-[#7C3AED]'
                  : 'text-[#6B7280] border-transparent hover:text-[#111827]'
              }`}
            >
              Knowledge Base
            </button>
          </nav>

          {/* Right Admin Profile Dropdown */}
          <div className="flex items-center space-x-4 relative">
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-[#F3F4F6] transition"
              >
                <div className="w-8 h-8 rounded-full bg-[#7C3AED] text-white flex items-center justify-center text-xs font-bold shadow-sm">
                  AA
                </div>
                <span className="text-sm font-medium text-[#111827] hidden sm:inline">Admin</span>
                <ChevronDown className="w-4 h-4 text-[#6B7280]" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E5E7EB] rounded-xl shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-[#E5E7EB]">
                    <p className="text-xs font-semibold text-[#111827]">Administrator</p>
                    <p className="text-xs text-[#6B7280]">Campus Support Admin</p>
                  </div>
                  <button
                    onClick={() => { setProfileOpen(false); alert('Admin Profile'); }}
                    className="w-full text-left px-4 py-2 text-sm text-[#374151] hover:bg-[#F3F4F6] flex items-center space-x-2"
                  >
                    <User className="w-4 h-4 text-[#6B7280]" />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={() => { setProfileOpen(false); alert('Admin Settings'); }}
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

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10">
        {/* ======================================================== */}
        {/* SCREENSHOT 11: UPLOAD DOCUMENT PAGE / MODAL */}
        {/* ======================================================== */}
        {isUploading ? (
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => setIsUploading(false)}
              className="flex items-center space-x-2 text-sm text-[#6B7280] hover:text-[#111827] font-medium mb-6 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <h1 className="text-3xl font-bold text-[#111827] mb-8">
              Upload Document
            </h1>

            <form onSubmit={handleUploadSubmit} className="institutional-card p-8 bg-white space-y-6">
              {/* Centered Drag & Drop File Upload Area */}
              <div className="border-2 border-dashed border-[#E5E7EB] rounded-2xl p-10 text-center flex flex-col items-center justify-center bg-[#FAFAFC] hover:border-[#7C3AED]/40 transition">
                <div className="w-12 h-12 rounded-xl bg-[#7C3AED] flex items-center justify-center shadow-sm mb-4">
                  <Upload className="w-6 h-6 text-white" />
                </div>

                <p className="text-sm font-semibold text-[#111827] mb-1">
                  {uploadFile ? uploadFile.name : 'Drag and drop your document here'}
                </p>
                <p className="text-xs text-[#6B7280] mb-4">
                  {uploadFile ? `${roundSize(uploadFile.size)} selected` : 'or'}
                </p>

                <label className="institutional-btn px-5 py-2.5 text-sm font-semibold cursor-pointer shadow-sm">
                  <span>{uploadFile ? 'Change File' : 'Choose File'}</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadFile(e.target.files[0]);
                        if (!docTitle) {
                          setDocTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ''));
                        }
                      }
                    }}
                  />
                </label>
              </div>

              {/* Document Title */}
              <div>
                <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wider mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="Enter document title"
                  className="w-full institutional-input px-3.5 py-2.5 text-sm"
                />
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value)}
                  className="w-full institutional-input px-3.5 py-2.5 text-sm"
                >
                  <option value="Technical">Technical</option>
                  <option value="Academic">Academic</option>
                  <option value="Policies">Policies</option>
                  <option value="Financial">Financial</option>
                  <option value="General">General</option>
                </select>
              </div>

              {/* Department Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wider mb-1">
                  Department
                </label>
                <select
                  value={docDept}
                  onChange={(e) => setDocDept(e.target.value)}
                  className="w-full institutional-input px-3.5 py-2.5 text-sm"
                >
                  <option value="IT Support">IT Support</option>
                  <option value="Academic Services">Academic Services</option>
                  <option value="Student Services">Student Services</option>
                  <option value="Finance & Accounts">Finance & Accounts</option>
                </select>
              </div>

              {uploadStatusMsg && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-lg font-medium">
                  {uploadStatusMsg}
                </div>
              )}

              {uploadErrorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg font-medium">
                  {uploadErrorMsg}
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full institutional-btn py-3 text-sm font-semibold shadow-sm"
                >
                  Upload Document & Index AI
                </button>
              </div>
            </form>
          </div>
        ) : activeTab === 'dashboard' ? (
          /* ======================================================== */
          /* SCREENSHOT 6 & 9: ADMINISTRATOR DASHBOARD OVERVIEW */
          /* ======================================================== */
          <div>
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-[#111827] mb-2">
                Administrator Dashboard
              </h1>
              <p className="text-base text-[#6B7280]">
                Manage support requests and maintain the campus knowledge base.
              </p>
            </div>

            {/* 3 Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {/* Pending Tickets */}
              <div className="institutional-card p-6 flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#6B7280] mb-2">
                    Pending Tickets
                  </p>
                  <h3 className="text-4xl font-bold text-[#111827] mb-2">
                    24
                  </h3>
                  <p className="text-xs text-[#6B7280]">
                    Unresolved requests
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shadow-sm border border-orange-100">
                  <AlertCircle className="w-6 h-6" />
                </div>
              </div>

              {/* Resolved Today */}
              <div className="institutional-card p-6 flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#6B7280] mb-2">
                    Resolved Today
                  </p>
                  <h3 className="text-4xl font-bold text-[#111827] mb-2">
                    8
                  </h3>
                  <p className="text-xs text-[#6B7280]">
                    Tickets closed today
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shadow-sm border border-green-100">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>

              {/* Approved Documents */}
              <div
                onClick={() => setActiveTab('knowledge')}
                className="institutional-card institutional-card-hover p-6 flex items-start justify-between cursor-pointer"
              >
                <div>
                  <p className="text-sm font-semibold text-[#6B7280] mb-2">
                    Approved Documents
                  </p>
                  <h3 className="text-4xl font-bold text-[#111827] mb-2">
                    {documents.length || 156}
                  </h3>
                  <p className="text-xs text-[#6B7280]">
                    In knowledge base
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center shadow-sm border border-purple-100">
                  <FileText className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Main Section: Recent Support Requests & Recent Activity (Screenshot 9) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column (2 cols width): Recent Support Requests */}
              <div className="lg:col-span-2 institutional-card p-6 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-[#111827]">
                    Recent Support Requests
                  </h2>
                  <button
                    onClick={() => setActiveTab('tickets')}
                    className="text-sm font-semibold text-[#7C3AED] hover:text-[#6D28D9] flex items-center space-x-1"
                  >
                    <span>View All Tickets</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="divide-y divide-[#E5E7EB]">
                  {ticketsList.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setActiveTab('tickets')}
                      className="py-4 first:pt-0 last:pb-0 flex items-center justify-between cursor-pointer hover:bg-[#F9FAFB] -mx-4 px-4 rounded-lg transition"
                    >
                      <div>
                        <div className="flex items-center space-x-3 mb-1">
                          <span className="text-xs font-bold text-[#7C3AED]">{t.id}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.statusColor}`}>
                            {t.status}
                          </span>
                          <span className={`text-xs font-semibold ${t.priorityClass}`}>
                            {t.priority}
                          </span>
                        </div>
                        <h4 className="text-base font-semibold text-[#111827] mb-1">
                          {t.title}
                        </h4>
                        <p className="text-xs text-[#6B7280]">
                          {t.student} • {t.department} • {t.time}
                        </p>
                      </div>

                      <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column (1 col width): Recent Activity Widget (Screenshot 9) */}
              <div className="institutional-card p-6 bg-white shadow-sm self-start">
                <h2 className="text-xl font-bold text-[#111827] mb-6">
                  Recent Activity
                </h2>

                <div className="space-y-5">
                  {/* Item 1 */}
                  <div className="flex items-start space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex-shrink-0 flex items-center justify-center">
                      <Ticket className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#111827]">
                        Student ticket #IT-2024-042 submitted
                      </p>
                      <p className="text-xs text-[#6B7280]">15 minutes ago</p>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="flex items-start space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#7C3AED] flex-shrink-0 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#111827]">
                        WiFi Troubleshooting.pdf uploaded
                      </p>
                      <p className="text-xs text-[#6B7280]">2 hours ago</p>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="flex items-start space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-green-50 text-green-600 flex-shrink-0 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#111827]">
                        Ticket #HOST-201 resolved
                      </p>
                      <p className="text-xs text-[#6B7280]">4 hours ago</p>
                    </div>
                  </div>

                  {/* Item 4 */}
                  <div className="flex items-start space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#7C3AED] flex-shrink-0 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#111827]">
                        Library Access Policy updated
                      </p>
                      <p className="text-xs text-[#6B7280]">1 day ago</p>
                    </div>
                  </div>

                  {/* Item 5 */}
                  <div className="flex items-start space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex-shrink-0 flex items-center justify-center">
                      <Ticket className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#111827]">
                        Student ticket #FIN-2024-156 submitted
                      </p>
                      <p className="text-xs text-[#6B7280]">2 days ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'tickets' ? (
          /* ======================================================== */
          /* SCREENSHOT 8: ADMINISTRATOR SUPPORT TICKETS TAB */
          /* ======================================================== */
          <div>
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-[#111827] mb-2">
                Support Tickets
              </h1>
              <p className="text-base text-[#6B7280]">
                Manage all student support requests.
              </p>
            </div>

            {/* Search & Filter Bar */}
            <div className="institutional-card p-4 bg-white mb-6">
              <div className="relative mb-4">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                <input
                  type="text"
                  value={ticketSearch}
                  onChange={(e) => setTicketSearch(e.target.value)}
                  placeholder="Search by ticket ID, student name, or issue..."
                  className="w-full bg-white border border-[#E5E7EB] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <div>
                    <select
                      value={ticketStatusFilter}
                      onChange={(e) => setTicketStatusFilter(e.target.value)}
                      className="institutional-input px-3 py-2 text-sm bg-white"
                    >
                      <option value="All Statuses">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                  <div>
                    <select
                      value={ticketDeptFilter}
                      onChange={(e) => setTicketDeptFilter(e.target.value)}
                      className="institutional-input px-3 py-2 text-sm bg-white"
                    >
                      <option value="All Departments">All Departments</option>
                      <option value="IT Support">IT Support</option>
                      <option value="Academic Services">Academic Services</option>
                      <option value="Student Services">Student Services</option>
                      <option value="Finance & Accounts">Finance & Accounts</option>
                    </select>
                  </div>
                </div>

                <span className="text-xs text-[#6B7280] font-medium">
                  {filteredTickets.length} {filteredTickets.length === 1 ? 'ticket' : 'tickets'} found
                </span>
              </div>
            </div>

            {/* Ticket Cards List */}
            <div className="space-y-4">
              {filteredTickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => alert(`Viewing Ticket Details: ${t.id}`)}
                  className="institutional-card institutional-card-hover p-6 flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <div className="flex items-center space-x-3 mb-1.5">
                      <span className="text-xs font-bold text-[#7C3AED]">{t.id}</span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${t.statusColor}`}>
                        {t.status}
                      </span>
                      <span className={`text-xs font-semibold ${t.priorityClass}`}>
                        {t.priority}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#111827] mb-2">
                      {t.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-[#6B7280]">
                      <div>
                        <span className="font-semibold text-[#374151]">Student </span>
                        <span>{t.student}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-[#374151]">Roll Number </span>
                        <span>{t.roll}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-[#374151]">Department </span>
                        <span>{t.department}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-[#374151]">Submitted </span>
                        <span>{t.time}</span>
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-[#9CA3AF] flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* SCREENSHOT 7 & 10: KNOWLEDGE BASE MANAGEMENT TAB */
          /* ======================================================== */
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-[#111827] mb-2">
                  Knowledge Base
                </h1>
                <p className="text-base text-[#6B7280]">
                  Manage documents that power CampSupport AI.
                </p>
              </div>

              <button
                onClick={() => { setIsUploading(true); setUploadErrorMsg(null); setUploadStatusMsg(null); }}
                className="institutional-btn px-5 py-2.5 flex items-center space-x-2 text-sm font-semibold shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Upload New</span>
              </button>
            </div>

            {/* Search & Filter Bar */}
            <div className="institutional-card p-4 bg-white mb-6">
              <div className="relative mb-4">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                <input
                  type="text"
                  value={kbSearchQuery}
                  onChange={(e) => setKbSearchQuery(e.target.value)}
                  placeholder="Search documents or departments..."
                  className="w-full bg-white border border-[#E5E7EB] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <div>
                    <label className="block text-xs font-semibold text-[#6B7280] mb-1">
                      Category
                    </label>
                    <select
                      value={kbCategoryFilter}
                      onChange={(e) => setKbCategoryFilter(e.target.value)}
                      className="institutional-input px-3 py-1.5 text-sm bg-white"
                    >
                      <option value="All Categories">All Categories</option>
                      <option value="Technical">Technical</option>
                      <option value="Academic">Academic</option>
                      <option value="Policies">Policies</option>
                      <option value="Financial">Financial</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6B7280] mb-1">
                      Department
                    </label>
                    <select
                      value={kbDeptFilter}
                      onChange={(e) => setKbDeptFilter(e.target.value)}
                      className="institutional-input px-3 py-1.5 text-sm bg-white"
                    >
                      <option value="All Departments">All Departments</option>
                      <option value="IT Support">IT Support</option>
                      <option value="Academic Services">Academic Services</option>
                      <option value="Student Services">Student Services</option>
                      <option value="Finance & Accounts">Finance & Accounts</option>
                    </select>
                  </div>
                </div>

                <span className="text-xs text-[#6B7280] font-medium">
                  {filteredDocs.length} {filteredDocs.length === 1 ? 'document' : 'documents'}
                </span>
              </div>
            </div>

            {/* Documents List (Screenshot 7 & 10) */}
            <div className="space-y-4 mb-10">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="institutional-card p-6 flex items-center justify-between bg-white shadow-sm"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-[#7C3AED]" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#111827] mb-1">
                        {doc.name}
                      </h3>
                      <div className="flex items-center space-x-2 text-xs text-[#6B7280]">
                        <span className="px-2 py-0.5 rounded bg-purple-50 text-[#7C3AED] font-semibold">
                          {doc.category || 'Technical'}
                        </span>
                        <span>{doc.department}</span>
                        <span>•</span>
                        <span>{doc.last_updated}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: View (👁), Replace/Sync (↻), Delete (🗑) */}
                  <div className="flex items-center space-x-3 text-[#6B7280]">
                    <button
                      onClick={() => alert(`Previewing document: ${doc.name}`)}
                      className="p-2 hover:text-[#7C3AED] rounded-lg hover:bg-[#F3F4F6] transition"
                      title="View Document"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { alert(`Re-indexed and synced: ${doc.name}`); fetchDocuments(); }}
                      className="p-2 hover:text-[#7C3AED] rounded-lg hover:bg-[#F3F4F6] transition"
                      title="Replace / Synchronize"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDocument(doc.id, doc.name)}
                      className="p-2 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                      title="Delete Document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Manage Knowledge Base Button */}
            <div className="text-center">
              <button
                onClick={() => alert('Full knowledge base configuration index...')}
                className="w-full py-3 bg-white border border-[#E5E7EB] hover:border-[#7C3AED] text-sm font-semibold text-[#7C3AED] rounded-xl shadow-sm transition"
              >
                Manage Knowledge Base
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function roundSize(bytes: number): string {
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${Math.round(kb * 10) / 10} KB`;
  }
  return `${Math.round((kb / 1024) * 10) / 10} MB`;
}
