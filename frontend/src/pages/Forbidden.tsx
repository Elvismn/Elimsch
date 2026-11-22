import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/context';
import { roleLanding } from '@/lib/roleLanding';

export function Forbidden() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <div className="max-w-md space-y-4 text-center">
        <h1 className="text-6xl font-bold text-destructive">403</h1>
        <h2 className="text-xl font-semibold">Access denied</h2>
        <p className="text-sm text-muted-foreground">
          You don't have permission to view this page.
        </p>
        <Button onClick={() => navigate(user ? roleLanding(user.role) : '/login')}>
          {user ? 'Back to home' : 'Sign in'}
        </Button>
      </div>
    </main>
  );
}