'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, Briefcase, Shield, ChevronRight } from 'lucide-react';

export default function RoleSelectionPage() {
  const router = useRouter();

  const roles = [
    {
      id: 'student',
      title: 'Student',
      icon: GraduationCap,
      description: 'Access AI support, create tickets, track requests, and browse the campus knowledge base.',
      href: '/student/auth',
    },
    {
      id: 'faculty',
      title: 'Faculty & Staff',
      icon: Briefcase,
      description: 'Submit departmental requests, report issues, and receive AI-powered assistance.',
      href: '/faculty/auth',
    },
    {
      id: 'admin',
      title: 'Administrator',
      icon: Shield,
      description: 'Manage tickets, monitor analytics, and administer the campus support platform.',
      href: '/admin/auth',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-[#111827] flex flex-col font-sans">
      {/* Institutional Breadcrumb Topbar */}
      <header className="w-full border-b border-[#E5E7EB] bg-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center text-sm text-[#6B7280]">
          <span className="hover:text-[#111827] cursor-pointer">Home</span>
          <span className="mx-2">/</span>
          <span className="hover:text-[#111827] cursor-pointer">Student Services</span>
          <span className="mx-2">/</span>
          <span className="text-[#111827] font-medium">Campus Support</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-5xl w-full text-center">
          {/* Header Title & Subtitle */}
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#111827] mb-3">
            Campus Support
          </h1>
          <p className="text-lg text-[#6B7280] mb-12">
            Select your role to continue.
          </p>

          {/* Three Role Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {roles.map((role) => {
              const IconComponent = role.icon;
              return (
                <div
                  key={role.id}
                  className="institutional-card institutional-card-hover p-8 flex flex-col justify-between"
                >
                  <div>
                    {/* Purple Rounded Icon Badge */}
                    <div className="w-12 h-12 rounded-xl bg-[#7C3AED] flex items-center justify-center mb-6 shadow-sm">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>

                    {/* Role Title */}
                    <h2 className="text-2xl font-bold text-[#111827] mb-3">
                      {role.title}
                    </h2>

                    {/* Role Description */}
                    <p className="text-[#6B7280] text-sm leading-relaxed mb-8">
                      {role.description}
                    </p>
                  </div>

                  {/* Continue Button */}
                  <button
                    onClick={() => router.push(role.href)}
                    className="w-full institutional-btn py-3 px-4 flex items-center justify-center space-x-2 text-sm font-semibold shadow-sm hover:shadow"
                  >
                    <span>Continue</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
