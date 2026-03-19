'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { AcademyProvider } from '@/providers/AcademyProvider';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Skeleton } from '@/components/ui/skeleton';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-glow-blue-sm">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          </div>
          <div className="space-y-2 text-center">
            <Skeleton className="mx-auto h-3 w-32" />
            <Skeleton className="mx-auto h-3 w-24" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <AcademyProvider>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex flex-1 flex-col pl-[240px]">
            <Topbar />
            <main className="flex-1 p-6">{children}</main>
          </div>
        </div>
      </AcademyProvider>
    </AuthGuard>
  );
}
