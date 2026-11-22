import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { SplashScreen } from '@/components/feedback/SplashScreen';
import { PATH } from '@/app/routePaths';
import { roleLanding } from '@/lib/roleLanding';
import type { UserRole } from '@/types/domain';
import { useAuth } from './context';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) return <SplashScreen />;
  if (!user) return <Navigate to={PATH.LOGIN} state={{ from: location.pathname }} replace />;
  return <>{children}</>;
}

export function GuestOnlyRoute({ children }: { children: ReactNode }) {
  const { user, isInitializing } = useAuth();

  if (isInitializing) return <SplashScreen />;
  if (user) return <Navigate to={roleLanding(user.role)} replace />;
  return <>{children}</>;
}

export function RoleGate({ roles, children }: { roles: UserRole[]; children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to={PATH.LOGIN} replace />;
  if (!roles.includes(user.role)) return <Navigate to={PATH.FORBIDDEN} replace />;
  return <>{children}</>;
}