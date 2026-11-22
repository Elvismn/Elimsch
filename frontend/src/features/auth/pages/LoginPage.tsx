import { Bus } from 'lucide-react';
import { APP_NAME } from '@/config/app';
import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Bus className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{APP_NAME}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Student transport management</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <LoginForm />
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Accounts are provisioned by your administrator.
        </p>
      </div>
    </main>
  );
}