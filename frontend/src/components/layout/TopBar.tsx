import { Bus } from 'lucide-react';
import { APP_NAME } from '@/config/app';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';

export function TopBar() {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-2 border-b border-border bg-background/95 px-4 backdrop-blur md:hidden">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Bus className="h-4 w-4" />
        </div>
        <span className="text-base font-semibold tracking-tight">{APP_NAME}</span>
      </div>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}