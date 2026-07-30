import './globals.css';
import type { Metadata } from 'next';
import React from 'react';
import { Navbar } from '../components/Navbar';

export const metadata: Metadata = {
  title: 'CampSupport AI | RAG-Powered Campus Helpdesk Assistant',
  description:
    'Instant, source-grounded answers to campus queries with guided detail collection and automatic support ticket escalation.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0a0d14] text-[#f3f4f6] selection:bg-emerald-500/30 selection:text-emerald-300">
        <Navbar />
        <main className="w-full">{children}</main>
      </body>
    </html>
  );
}
