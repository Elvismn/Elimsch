import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/context';
import { roleLanding } from '@/lib/roleLanding';

export function NotFound() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <div className="max-w-md space-y-4 text-center">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-xl font-semibold">Page not found</h2>
        <p className="text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has moved.
        </p>
        <Button onClick={() => navigate(user ? roleLanding(user.role) : '/login')}>
          {user ? 'Back to home' : 'Sign in'}
        </Button>
      </div>
    </main>
  );
}