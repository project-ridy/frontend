'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { getAccessToken } from '@/lib/auth/token-storage';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!getAccessToken()) {
      router.push('/login');
      return;
    }

    setIsChecking(false);
  }, [router]);

  if (isChecking) {
    return <div className="p-4 text-small text-gray-500">인증 상태를 확인하는 중입니다.</div>;
  }

  return children;
}
