'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChatHelpdesk } from '../components/ChatHelpdesk';

export default function HomePage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('campsupport_user');
    if (!user) {
      router.replace('/login');
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400 text-xs">
        Checking authentication session...
      </div>
    );
  }

  return (
    <section aria-label="CampSupport AI Chat Helpdesk" className="w-full">
      <ChatHelpdesk />
    </section>
  );
}
