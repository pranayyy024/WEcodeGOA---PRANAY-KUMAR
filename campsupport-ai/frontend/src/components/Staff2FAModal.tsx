'use client';

import React, { useState } from 'react';
import { ShieldAlert, KeyRound, Lock, CheckCircle2, AlertCircle, X, UserCheck } from 'lucide-react';

interface Staff2FAModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  collegeId: string;
}

export const Staff2FAModal: React.FC<Staff2FAModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  collegeId,
}) => {
  const [email, setEmail] = useState('admin@gec.ac.in');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      if (pin === '2026') {
        setLoading(false);
        onSuccess();
      } else {
        setLoading(false);
        setError('❌ Authentication Failed: Invalid 2FA Security PIN. Unauthorized database access is strictly restricted.');
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md p-6 rounded-2xl glass-panel border border-purple-500/40 shadow-2xl relative space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          title="Cancel Authentication"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-glow-blue">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider border border-purple-500/30">
              Two-Factor Authentication (2FA)
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight mt-1">
              Staff Database Access Verification
            </h2>
            <p className="text-xs text-slate-400">
              Tenant: <span className="text-blue-400 font-semibold">{collegeId}</span>
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-white/5">
          Restricted to authorized university staff, faculty, and registrars. Students attempting unauthorized database edits will be logged and denied access.
        </p>

        {/* 2FA Form */}
        <form onSubmit={handleVerify2FA} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Faculty / Employee Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. registrar@gec.ac.in"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-400">
                2FA Security PIN / OTP
              </label>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                💡 Demo PIN: 2026
              </span>
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter 4-digit security token..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white font-mono tracking-widest focus:outline-none focus:border-purple-500"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold shadow-glow-blue transition-all"
            >
              {loading ? (
                <span>Verifying 2FA...</span>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Verify & Unlock Staff Controls</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
