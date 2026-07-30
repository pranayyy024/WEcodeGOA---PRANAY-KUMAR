import React from 'react';
import { ChatHelpdesk } from '../components/ChatHelpdesk';

export default function HomePage() {
  return (
    <section aria-label="CampSupport AI Chat Helpdesk" className="w-full">
      <ChatHelpdesk />
    </section>
  );
}
