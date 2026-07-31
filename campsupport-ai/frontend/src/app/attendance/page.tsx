'use client';

import React, { useState, useEffect } from 'react';
import { AttendanceDashboard } from '../../components/AttendanceDashboard';

export default function AttendancePage() {
  const [role, setRole] = useState<'STUDENT' | 'TEACHER'>('STUDENT');
  const [collegeId, setCollegeId] = useState<string>('GEC');

  useEffect(() => {
    const savedRole = localStorage.getItem('campsupport_role') as 'STUDENT' | 'TEACHER';
    const savedCollege = localStorage.getItem('campsupport_college');
    if (savedRole) setRole(savedRole);
    if (savedCollege) setCollegeId(savedCollege);

    const handleStorageChange = () => {
      const updatedRole = localStorage.getItem('campsupport_role') as 'STUDENT' | 'TEACHER';
      const updatedCollege = localStorage.getItem('campsupport_college');
      if (updatedRole) setRole(updatedRole);
      if (updatedCollege) setCollegeId(updatedCollege);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('role_college_changed', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('role_college_changed', handleStorageChange);
    };
  }, []);

  return (
    <section aria-label="Campus Student Attendance Portal" className="w-full">
      <AttendanceDashboard role={role} collegeId={collegeId} />
    </section>
  );
}
