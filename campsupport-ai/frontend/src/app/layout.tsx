import './globals.css';
import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'CampSupport AI | Institutional Portal & AI Helpdesk',
  description:
    'Official AI-powered campus support system integrated into the college ERP portal for students, faculty, and administrators.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FAFAFC] text-[#111827] font-sans antialiased selection:bg-[#7C3AED]/20 selection:text-[#7C3AED]">
        {children}
      </body>
    </html>
  );
}
