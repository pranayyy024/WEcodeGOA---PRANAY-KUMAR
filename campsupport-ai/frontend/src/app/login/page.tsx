'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FAFAFC] flex items-center justify-center text-[#6B7280] text-sm">
      Redirecting to role selection...
    </div>
  );
}
