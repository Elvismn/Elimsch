import { Bus } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { useAuth } from '@/features/auth/context';

export function DriverHome() {
  const { user } = useAuth();
  return (
    <>
      <PageHeader title="Today" description={`Signed in as ${user?.name ?? ''}`} />
      <EmptyState
        icon={Bus}
        title="Driver workflow coming in Phase 4"
        description="Today's trip, lifecycle actions, and vehicle status will live here."
      />
    </>
  );
}