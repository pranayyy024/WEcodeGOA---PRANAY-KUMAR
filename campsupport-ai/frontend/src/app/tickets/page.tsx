import React from 'react';
import { TicketsDashboard } from '../../components/TicketsDashboard';

export default function TicketsPage() {
  return (
    <section aria-label="Campus Support Tickets Tracker" className="w-full">
      <TicketsDashboard />
    </section>
  );
}
