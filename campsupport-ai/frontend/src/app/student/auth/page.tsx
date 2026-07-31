'use client';

import React from 'react';
import { RoleAuthCard } from '../../../components/RoleAuthCard';

export default function StudentAuthPage() {
  return (
    <RoleAuthCard
      role="student"
      title="Student"
      idLabel="Roll Number"
      idPlaceholder="Enter your roll number"
      allowRegister={true}
      defaultId="2024CS001"
      defaultPassword="password123"
      dashboardPath="/student/dashboard"
    />
  );
}
