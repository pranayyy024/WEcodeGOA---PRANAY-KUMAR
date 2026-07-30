'use client';

import React, { useState } from 'react';
import { Send, AlertCircle, Building2, User } from 'lucide-react';

interface DetailCollectorFormProps {
  missingFields: string[];
  onSubmitDetails: (details: Record<string, string>) => void;
}

export const DetailCollectorForm: React.FC<DetailCollectorFormProps> = ({
  missingFields,
  onSubmitDetails,
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitDetails(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 p-4 rounded-xl bg-slate-900/90 border border-blue-500/30 shadow-lg space-y-3 animate-fade-in"
    >
      <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
        <AlertCircle className="w-4 h-4" />
        <span>Required Helpdesk Information</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {missingFields.map((field) => (
          <div key={field} className="space-y-1">
            <label className="text-xs text-slate-300 font-medium capitalize flex items-center gap-1.5">
              {field.includes('room') ? (
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
              ) : (
                <User className="w-3.5 h-3.5 text-blue-400" />
              )}
              {field.replace('_', ' ')}
            </label>
            <input
              type="text"
              required
              placeholder={`Enter ${field.replace('_', ' ')}...`}
              value={formData[field] || ''}
              onChange={(e) => handleChange(field, e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        ))}
      </div>

      <button
        type="submit"
        className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-glow-blue"
      >
        <span>Submit Information & Route Ticket</span>
        <Send className="w-3.5 h-3.5" />
      </button>
    </form>
  );
};
