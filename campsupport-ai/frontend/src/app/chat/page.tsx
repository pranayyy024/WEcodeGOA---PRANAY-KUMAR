'use client';

import React, { Suspense } from 'react';
import { ChatHelpdesk } from '../../components/ChatHelpdesk';

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAFC] flex items-center justify-center text-sm text-[#6B7280]">Loading CampSupport AI Helpdesk...</div>}>
      <ChatHelpdesk />
    </Suspense>
  );
}
