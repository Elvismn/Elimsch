import { MoreHorizontal } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { NAV_ITEMS } from '@/config/nav';
import { useAuth } from '@/features/auth/context';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const { user } = useAuth();
  if (!user) return null;

  const items = NAV_ITEMS[user.role];
  const visible = items.slice(0, 4);
  const overflow = items.slice(4);
  const cols = visible.length + (overflow.length ? 1 : 0);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 pb-[var(--safe-area-bottom)] backdrop-blur md:hidden">
      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {visible.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}

        {overflow.length > 0 && (
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-none text-[11px] font-medium text-muted-foreground hover:text-foreground"
              >
                <MoreHorizontal className="h-5 w-5" />
                More
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="pb-[var(--safe-area-bottom)]">
              <SheetHeader>
                <SheetTitle>More</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-1">
                {overflow.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      )
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </nav>
  );
}