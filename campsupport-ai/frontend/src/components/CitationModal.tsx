'use client';

import React from 'react';
import { FileText, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { Citation } from '../types/chat';

interface CitationModalProps {
  citation: Citation | null;
  onClose: () => void;
}

export const CitationModal: React.FC<CitationModalProps> = ({ citation, onClose }) => {
  if (!citation) return null;

  const matchPercentage = Math.round(citation.relevance_score * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="glass-panel w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-emerald-500/30 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base leading-tight">
                Verified Campus Document
              </h3>
              <p className="text-xs text-emerald-400 font-medium mt-0.5">
                {citation.source_document}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Confidence Badge */}
        <div className="my-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-950/40 border border-emerald-500/20">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-slate-300">
            Source-Backed Grounding Score:
          </span>
          <span className="text-xs font-bold text-emerald-400">
            {matchPercentage}% Confidence
          </span>
        </div>

        {/* Snippet Content */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 font-mono text-sm text-slate-200 leading-relaxed max-h-60 overflow-y-auto">
          &ldquo;{citation.snippet}&rdquo;
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Approved by Campus Administration</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-glow-emerald"
          >
            Close Citation
          </button>
        </div>
      </div>
    </div>
  );
};
