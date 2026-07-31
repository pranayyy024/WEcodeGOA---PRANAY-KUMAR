'use client';

import React from 'react';
import { RoleAuthCard } from '../../../components/RoleAuthCard';

export default function AdminAuthPage() {
  return (
    <RoleAuthCard
      role="admin"
      title="Administrator"
      idLabel="Administrator ID"
      idPlaceholder="Enter your administrator ID"
      allowRegister={false}
      defaultId="admin@pcce.ac.in"
      defaultPassword="password123"
      dashboardPath="/admin/dashboard"
    />
  );
}
