'use client';

import React from 'react';
import { RoleAuthCard } from '../../../components/RoleAuthCard';

export default function FacultyAuthPage() {
  return (
    <RoleAuthCard
      role="faculty"
      title="Faculty & Staff"
      idLabel="Faculty ID"
      idPlaceholder="Enter your faculty ID"
      allowRegister={true}
      defaultId="FAC101"
      defaultPassword="password123"
      dashboardPath="/faculty/dashboard"
    />
  );
}
