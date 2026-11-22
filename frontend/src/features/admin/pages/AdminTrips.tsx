import { Bus } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { useAuth } from '@/features/auth/context';

export function AdminTrips() {
  const { user } = useAuth();
  return (
    <>
      <PageHeader title="Trips" description={`Signed in as ${user?.name ?? ''}`} />
      <EmptyState
        icon={Bus}
        title="Admin trip management coming in Phase 4"
        description="Create, list, and inspect daily trips — plus master data CRUD — will live here."
      />
    </>
  );
}