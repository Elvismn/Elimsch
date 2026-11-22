import { Home } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { useAuth } from '@/features/auth/context';

export function ParentHome() {
  const { user } = useAuth();
  return (
    <>
      <PageHeader
        title={`Hello, ${user?.name.split(' ')[0] ?? 'there'}`}
        description="Your children's transport at a glance."
      />
      <EmptyState
        icon={Home}
        title="Parent dashboard coming in Phase 3"
        description="Your children, their routes, and today's trips will appear here."
      />
    </>
  );
}