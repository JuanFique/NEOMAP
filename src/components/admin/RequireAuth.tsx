import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { email, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return <div className="flex h-[100dvh] items-center justify-center text-sm text-slate-500">Cargando…</div>;
  }
  if (!email) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}
