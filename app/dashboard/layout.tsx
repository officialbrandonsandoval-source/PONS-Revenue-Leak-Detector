'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const { isConnected, isManagerMode, setVoiceActive } = useApp();

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  useEffect(() => {
    return () => {
      setVoiceActive(false);
    };
  }, [setVoiceActive]);

  if (!isConnected) return null;

  return (
    <div className={isManagerMode ? 'manager-mode' : ''}>
      {children}
    </div>
  );
}
