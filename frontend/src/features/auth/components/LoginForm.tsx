import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { roleLanding } from '@/lib/roleLanding';
import type { NormalizedError } from '@/types/api';
import { useAuth } from '../context';
import { useLoginMutation } from '../hooks';
import { loginSchema, type LoginInput } from '../schemas';
import { DemoCredentials } from './DemoCredentials';

export function LoginForm() {
  const { setSession } = useAuth();
  const loginMutation = useLoginMutation();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onSubmit',
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const { token, user } = await loginMutation.mutateAsync(values);
      setSession(token, user);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}`);

      const from = (location.state as { from?: string } | null)?.from;
      navigate(from || roleLanding(user.role), { replace: true });
    } catch (err) {
      const e = err as NormalizedError;
      if (e.status === 429) {
        toast.error('Too many attempts. Try again in 15 minutes.');
      } else if (e.status === 401) {
        toast.error('Invalid email or password.');
      } else if (e.errors?.length) {
        e.errors.forEach((fieldErr) => {
          if (fieldErr.path && fieldErr.path in loginSchema.shape) {
            form.setError(fieldErr.path as keyof LoginInput, { message: fieldErr.message });
          }
        });
        toast.error(e.message);
      } else {
        toast.error(e.message || 'Login failed. Please try again.');
      }
    }
  });

  const fillDemo = (email: string, password: string) => {
    form.setValue('email', email, { shouldValidate: true });
    form.setValue('password', password, { shouldValidate: true });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoFocus
          placeholder="you@elimsch.com"
          {...form.register('email')}
          aria-invalid={Boolean(form.formState.errors.email)}
        />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            {...form.register('password')}
            aria-invalid={Boolean(form.formState.errors.password)}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-2 flex items-center rounded px-2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {form.formState.errors.password && (
          <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
        {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
      </Button>

      <DemoCredentials onFill={fillDemo} />
    </form>
  );
}