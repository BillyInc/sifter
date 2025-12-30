'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, requiredRole, fallback }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return fallback || <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return fallback || <LoadingSpinner />;
  }

  if (requiredRole && user) {
    const roleHierarchy: Record<UserRole, number> = {
      'user': 1,
      'researcher': 2,
      'vc': 3,
      'admin': 4
    };

    if (roleHierarchy[user.role] < roleHierarchy[requiredRole]) {
      return (
        <div className="min-h-screen bg-sifter-dark flex items-center justify-center p-4">
          <div className="bg-sifter-card border border-sifter-border rounded-xl p-8 max-w-md text-center">
            <div className="text-red-400 text-4xl mb-4">403</div>
            <h2 className="text-white text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-400">You don&apos;t have permission to view this page.</p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-sifter-dark flex items-center justify-center">
      <svg className="animate-spin h-8 w-8 text-sifter-blue" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>
  );
}

export default ProtectedRoute;
