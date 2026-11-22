import { ClipboardList } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { useAuth } from '@/features/auth/context';

export function CodriverHome() {
  const { user } = useAuth();
  return (
    <>
      <PageHeader title="Manifest" description={`Signed in as ${user?.name ?? ''}`} />
      <EmptyState
        icon={ClipboardList}
        title="Co-driver manifest coming in Phase 3"
        description="Today's trip manifest with board/drop controls will live here."
      />
    </>
  );
}