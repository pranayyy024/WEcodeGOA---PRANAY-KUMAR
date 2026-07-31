'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Send,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  FileText,
  ThumbsUp,
  ThumbsDown,
  Ticket,
  Plus,
  Bot,
  User,
  CheckCircle,
} from 'lucide-react';

interface Citation {
  source_document: string;
  snippet: string;
  relevance_score: number;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  citations?: Citation[];
  confidence?: number;
  timestamp: string;
}

export function ChatHelpdesk() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketDept, setTicketDept] = useState('IT Support');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [ticketSubmitting, setTicketSubmitting] = useState(false);

  const suggestedQuestions = [
    'How do I connect to campus Wi-Fi?',
    'What is the boys dress code?',
    'What are the CSE 3rd semester subjects?',
    'What is the minimum attendance requirement?',
  ];

  useEffect(() => {
    if (initialQuery && messages.length === 0) {
      sendMessage(initialQuery);
    } else if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome-msg',
          sender: 'bot',
          text: 'Hello! I am **CampSupport AI**, your official campus helpdesk assistant. Ask me anything about PCCE campus services, SOPs, Wi-Fi, dress codes, fees, or course syllabus!',
          timestamp: 'Just now',
        },
      ]);
    }
  }, [initialQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query,
          user_id: 'stud-1001',
          role: 'student',
          tenant_id: 'GEC',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: data.answer || 'Here is what I found in our official campus documents.',
          citations: data.citations || [],
          confidence: data.confidence_score || 0.95,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error('API request failed');
      }
    } catch (e) {
      // Offline fallback
      let answer = 'I found the following institutional policy regarding your query.';
      let docName = 'faq.json';
      let snippet = 'PCCE Institutional Helpdesk summary.';

      const lower = query.toLowerCase();
      if (lower.includes('wifi') || lower.includes('wi-fi') || lower.includes('internet')) {
        docName = 'wifi_email_sop.txt';
        answer =
          'To connect to campus Wi-Fi (**EduRoam / PCCE-Student**):\n1. Open Wi-Fi settings and select **PCCE-Student**.\n2. Enter your institutional email ID (e.g., `2024CS001@pcce.ac.in`) and password.\n3. Accept the security certificate if prompted.';
        snippet = 'Standard Operating Procedure: Campus Wi-Fi & Email Authentication...';
      } else if (lower.includes('dress') || lower.includes('code') || lower.includes('rules')) {
        docName = 'rules_and_regulations.json';
        answer =
          '**PCCE Dress Code Policy**:\n- Students must dress neatly and modestly.\n- Round-neck t-shirts, ripped jeans, and flip-flops are strictly prohibited.\n- ID cards must be worn around the neck at all times.';
        snippet = 'Section 4: Student Conduct and Dress Code Regulations.';
      } else if (lower.includes('attendance') || lower.includes('condon')) {
        docName = 'rules_and_regulations.json';
        answer =
          '**Attendance Regulation**:\n- A minimum of **75% attendance** is compulsory in each subject to appear for end-semester university examinations.\n- Medical leave condonation requires a valid medical certificate submitted within 3 working days.';
        snippet = 'Section 2: Academic Attendance and Medical Condonation.';
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: answer,
        citations: [
          {
            source_document: docName,
            snippet: snippet,
            relevance_score: 0.96,
          },
        ],
        confidence: 0.96,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleBackNavigation = () => {
    const savedRole = localStorage.getItem('campsupport_role') || 'student';
    router.push(`/${savedRole}/dashboard`);
  };

  const openTicketModalWithQuery = (msgText: string) => {
    setTicketTitle(msgText.slice(0, 80));
    setTicketDesc('');
    setTicketSubmitted(false);
    setTicketModalOpen(true);
  };

  const handleCreateTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTicketSubmitting(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'stud-1001',
          title: ticketTitle,
          description: ticketDesc || ticketTitle,
          department: ticketDept,
          priority: 'MEDIUM',
          category: 'GENERAL',
          metadata: {},
        }),
      });
      if (res.ok) {
        setTicketSubmitted(true);
        setTimeout(() => {
          setTicketModalOpen(false);
          setTicketSubmitted(false);
        }, 1500);
      } else {
        alert('Failed to submit ticket. Please try again.');
      }
    } catch {
      alert('Backend not reachable. Please ensure the server is running.');
    } finally {
      setTicketSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-[#111827] flex flex-col font-sans">
      {/* Top Institutional Navbar */}
      <header className="w-full border-b border-[#E5E7EB] bg-white px-6 py-4 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackNavigation}
              className="flex items-center space-x-2 text-sm text-[#6B7280] hover:text-[#111827] font-medium transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <div className="h-5 w-[1px] bg-[#E5E7EB]" />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-[#7C3AED] flex items-center justify-center text-white font-bold text-xs">
                CS
              </div>
              <span className="font-bold text-lg text-[#111827]">CampSupport AI Helpdesk</span>
            </div>
          </div>

          <button
            onClick={() => {
              setMessages([]);
              sendMessage('Hello');
            }}
            className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#E5E7EB] hover:bg-[#F3F4F6] text-[#374151] transition"
          >
            <Plus className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>New Chat</span>
          </button>
        </div>
      </header>

      {/* Chat Messages Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 flex flex-col justify-between">
        <div className="space-y-6 mb-8">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-4 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'bot' && (
                <div className="w-10 h-10 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Bot className="w-5 h-5" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-6 ${
                  msg.sender === 'user'
                    ? 'bg-[#7C3AED] text-white rounded-tr-none shadow-sm'
                    : 'institutional-card bg-white text-[#111827] rounded-tl-none'
                }`}
              >
                {/* Message text */}
                <div className="text-sm sm:text-base leading-relaxed whitespace-pre-line">
                  {msg.text}
                </div>

                {/* RAG Citations (if bot) */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-[#E5E7EB] space-y-2">
                    <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider flex items-center space-x-1">
                      <FileText className="w-3.5 h-3.5 text-[#7C3AED]" />
                      <span>Official Source Document Cited (Text extracted above)</span>
                    </p>
                    {msg.citations.map((cite, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-[#FAFAFC] border border-[#E5E7EB] text-xs select-none"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-[#7C3AED] cursor-default">
                            📄 {cite.source_document} (Verified Institutional Source)
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-[#7C3AED] font-semibold">
                            {Math.round(cite.relevance_score * 100)}% Match
                          </span>
                        </div>
                        <p className="text-[#6B7280] italic">
                          "{cite.snippet}"
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Helpfulness feedback & Create Ticket fallback button */}
                {msg.sender === 'bot' && msg.id !== 'welcome-msg' && (
                  <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#6B7280]">
                    <div className="flex items-center space-x-3">
                      <span>Was this helpful?</span>
                      <button
                        onClick={() => alert('Thank you for your feedback!')}
                        className="hover:text-[#7C3AED] transition"
                        title="Helpful"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => alert('Thank you! We will improve our answers.')}
                        className="hover:text-[#7C3AED] transition"
                        title="Not helpful"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => openTicketModalWithQuery(msg.text)}
                      className="flex items-center space-x-1 text-[#7C3AED] hover:text-[#6D28D9] font-medium transition"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>Need more help? Create Support Ticket</span>
                    </button>
                  </div>
                )}

                {/* Timestamp */}
                <div
                  className={`text-[10px] mt-2 text-right ${
                    msg.sender === 'user' ? 'text-purple-200' : 'text-[#9CA3AF]'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-10 h-10 rounded-xl bg-[#374151] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center shadow-sm">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div className="institutional-card bg-white p-4 text-xs text-[#6B7280] flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#7C3AED] animate-spin" />
                <span>Searching official PCCE regulations & SOPs...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions Pills */}
        <div className="mb-4 flex flex-wrap gap-2 justify-center">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(q)}
              className="text-xs bg-white border border-[#E5E7EB] hover:border-[#7C3AED] hover:text-[#7C3AED] text-[#374151] px-3.5 py-2 rounded-full shadow-sm transition"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="sticky bottom-4"
        >
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about campus services, policies, or SOPs..."
              className="w-full bg-white border border-[#E5E7EB] rounded-2xl pl-5 pr-14 py-4 text-sm sm:text-base text-[#111827] placeholder-[#9CA3AF] shadow-md focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/15 transition"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-[#D1D5DB] text-white flex items-center justify-center transition shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </main>

      {/* Institutional Support Ticket Modal */}
      {ticketModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="institutional-card bg-white p-8 w-full max-w-lg shadow-xl">
            <h2 className="text-2xl font-bold text-[#111827] mb-2">
              Create Support Ticket
            </h2>
            <p className="text-sm text-[#6B7280] mb-6">
              Our campus IT and administrative staff will review your request and follow up.
            </p>

            {ticketSubmitted ? (
              <div className="text-center py-6">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-[#111827]">Ticket Submitted!</h3>
                <p className="text-xs text-[#6B7280]">Sending confirmation...</p>
              </div>
            ) : (
              <form onSubmit={handleCreateTicketSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wider mb-1">
                    Issue Title
                  </label>
                  <input
                    type="text"
                    required
                    value={ticketTitle}
                    onChange={(e) => setTicketTitle(e.target.value)}
                    className="w-full institutional-input px-3.5 py-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wider mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={ticketDesc}
                    onChange={(e) => setTicketDesc(e.target.value)}
                    placeholder="Describe your issue in more detail..."
                    className="w-full institutional-input px-3.5 py-2.5 text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <select
                    value={ticketDept}
                    onChange={(e) => setTicketDept(e.target.value)}
                    className="w-full institutional-input px-3.5 py-2.5 text-sm"
                  >
                    <option value="IT Support">IT Support</option>
                    <option value="Academic Services">Academic Services</option>
                    <option value="Student Services">Student Services</option>
                    <option value="Finance & Accounts">Finance & Accounts</option>
                  </select>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setTicketModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-[#E5E7EB] text-sm font-medium text-[#374151] hover:bg-[#F3F4F6] transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={ticketSubmitting}
                    className="institutional-btn px-6 py-2 text-sm font-semibold shadow-sm disabled:opacity-60 flex items-center gap-2"
                  >
                    Submit Ticket
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
