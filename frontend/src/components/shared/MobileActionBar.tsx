import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function MobileActionBar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 pb-[calc(var(--safe-area-bottom)+0.75rem)] pt-3 backdrop-blur md:hidden',
        className,
      )}
    >
      {children}
    </div>
  );
}