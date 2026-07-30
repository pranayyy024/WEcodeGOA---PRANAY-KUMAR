'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { ChatMessage, Citation } from '../types/chat';
import { sendChatMessage } from '../lib/api';
import { CitationModal } from './CitationModal';
import { DetailCollectorForm } from './DetailCollectorForm';

const SAMPLE_PROMPTS = [
  'How do I connect to campus Wi-Fi in Block B?',
  'What is the minimum attendance required for semester exams?',
  'There is an electrical repair fault in Hostel Block A room light',
  'Connect to human helpdesk agent for network login bug',
];

export const ChatHelpdesk: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'agent',
      text: 'Hello! I am **CampSupport AI**, your RAG-powered campus helpdesk assistant. I answer campus policy questions from approved documents and automatically route support tickets to Campus IT, Academic Registrar, or Hostel Administration.\n\nHow can I help you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (queryText?: string, extraMetadata?: Record<string, string>) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() && !extraMetadata) return;

    if (!extraMetadata) {
      const newUserMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: textToSend,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, newUserMsg]);
      setInput('');
    }

    setLoading(true);

    try {
      const response = await sendChatMessage(
        textToSend,
        'student-demo-01',
        undefined,
        extraMetadata
      );

      const newAgentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: response.citations,
        confidenceScore: response.confidence_score,
        requiresFollowUp: response.requires_follow_up,
        missingFields: response.missing_fields,
        ticketCreated: response.ticket_created,
        departmentRouted: response.department_routed,
      };

      setMessages((prev) => [...prev, newAgentMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'agent',
        text: 'I encountered an error connecting to the campus helpdesk server. Please check that the FastAPI backend (`http://localhost:8000`) is running.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-msg',
        sender: 'agent',
        text: 'Hello! I am **CampSupport AI**, your RAG-powered campus helpdesk assistant. How can I help you today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-90px)] max-w-5xl mx-auto p-4 sm:p-6">
      {/* Top Banner / Controls */}
      <div className="flex items-center justify-between mb-4 px-4 py-2.5 rounded-2xl glass-card border border-white/5">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse-slow" />
          <span>
            Knowledge Base Active • Grounded in Approved Campus SOPs & Policies
          </span>
        </div>
        <button
          onClick={handleClearChat}
          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs text-slate-400 hover:text-white transition-colors border border-white/5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Chat</span>
        </button>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              {/* Avatar Left */}
              {!isUser && (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-glow-emerald flex-shrink-0 mt-1">
                  <Bot className="w-5 h-5" />
                </div>
              )}

              {/* Message Content */}
              <div
                className={`max-w-2xl rounded-2xl p-4 ${
                  isUser
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-glow-blue rounded-tr-none'
                    : 'glass-card border border-white/10 text-slate-100 rounded-tl-none'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1">
                  <span className="text-xs font-semibold text-slate-400">
                    {isUser ? 'You (Student)' : 'CampSupport AI Assistant'}
                  </span>
                  <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                </div>

                {/* Body Text */}
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.text}
                </div>

                {/* Source Citations Pill List */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verified Knowledge Base Citations:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {msg.citations.map((citation, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedCitation(citation)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/30 text-emerald-300 text-xs font-medium transition-all hover:scale-105"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{citation.source_document}</span>
                          <span className="px-1.5 py-0.5 rounded-lg bg-emerald-500/20 text-[10px] font-bold">
                            {Math.round(citation.relevance_score * 100)}% Match
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ticket Created Notification Badge */}
                {msg.ticketCreated && (
                  <div className="mt-3 p-3 rounded-xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-400" />
                      <div>
                        <div className="text-xs font-bold text-white">
                          Ticket {msg.ticketCreated.ticket_id} Created
                        </div>
                        <div className="text-[11px] text-blue-300">
                          Routed to: <strong>{msg.ticketCreated.department}</strong> • Status: {msg.ticketCreated.status}
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-semibold">
                      High Priority
                    </span>
                  </div>
                )}

                {/* Guided Follow-Up Detail Collector Form */}
                {msg.requiresFollowUp && msg.missingFields && msg.missingFields.length > 0 && (
                  <DetailCollectorForm
                    missingFields={msg.missingFields}
                    onSubmitDetails={(details) => handleSendMessage(undefined, details)}
                  />
                )}
              </div>

              {/* Avatar Right */}
              {isUser && (
                <div className="w-9 h-9 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-slate-300 flex-shrink-0 mt-1">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-start gap-3 justify-start animate-fade-in">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-glow-emerald">
              <Bot className="w-5 h-5 animate-spin" />
            </div>
            <div className="glass-card border border-white/10 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-2 text-sm text-slate-300">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Retrieving campus policy documents & verifying grounding...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Sample Quick Prompts */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500 font-medium">Quick Test Queries:</span>
        {SAMPLE_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs border border-white/5 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <span>{prompt}</span>
            <ArrowRight className="w-3 h-3 text-slate-500" />
          </button>
        ))}
      </div>

      {/* Chat Input Footer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="relative flex items-center"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          placeholder="Ask about campus Wi-Fi, exam rules, or report a hostel repair issue..."
          className="w-full py-3.5 pl-4 pr-28 rounded-2xl glass-panel text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 transition-all shadow-xl"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="absolute right-2 top-1.5 bottom-1.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-glow-emerald"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Citation Detail Modal */}
      <CitationModal
        citation={selectedCitation}
        onClose={() => setSelectedCitation(null)}
      />
    </div>
  );
};
