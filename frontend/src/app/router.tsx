import { Navigate, createBrowserRouter, RouterProvider } from 'react-router-dom';

import { AppShell } from '@/components/layout/AppShell';
import { SplashScreen } from '@/components/feedback/SplashScreen';
import { GuestOnlyRoute, ProtectedRoute, RoleGate } from '@/features/auth/guards';
import { useAuth } from '@/features/auth/context';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { ParentHome } from '@/features/parent/pages/ParentHome';
import { CodriverHome } from '@/features/codriver/pages/CodriverHome';
import { DriverHome } from '@/features/driver/pages/DriverHome';
import { AdminTrips } from '@/features/admin/pages/AdminTrips';
import { Forbidden } from '@/pages/Forbidden';
import { NotFound } from '@/pages/NotFound';
import { roleLanding } from '@/lib/roleLanding';
import { PATH } from './routePaths';

function RootRedirect() {
  const { user, isInitializing } = useAuth();
  if (isInitializing) return <SplashScreen />;
  if (!user) return <Navigate to={PATH.LOGIN} replace />;
  return <Navigate to={roleLanding(user.role)} replace />;
}

const router = createBrowserRouter([
  { path: PATH.LOGIN, element: <GuestOnlyRoute><LoginPage /></GuestOnlyRoute> },
  { path: PATH.ROOT, element: <RootRedirect /> },

  {
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        path: PATH.PARENT_HOME,
        element: (
          <RoleGate roles={['parent']}>
            <ParentHome />
          </RoleGate>
        ),
      },
      {
        path: PATH.CODRIVER_HOME,
        element: (
          <RoleGate roles={['co-driver']}>
            <CodriverHome />
          </RoleGate>
        ),
      },
      {
        path: PATH.DRIVER_HOME,
        element: (
          <RoleGate roles={['driver']}>
            <DriverHome />
          </RoleGate>
        ),
      },
      {
        path: PATH.ADMIN_TRIPS,
        element: (
          <RoleGate roles={['admin']}>
            <AdminTrips />
          </RoleGate>
        ),
      },
    ],
  },

  { path: PATH.FORBIDDEN, element: <Forbidden /> },
  { path: '*', element: <NotFound /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}