import { Bus } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { NAV_ITEMS } from '@/config/nav';
import { APP_NAME } from '@/config/app';
import { useAuth } from '@/features/auth/context';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const { user } = useAuth();
  if (!user) return null;
  const items = NAV_ITEMS[user.role];

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-card md:flex md:flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-border px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Bus className="h-5 w-5" />
        </div>
        <span className="text-lg font-semibold tracking-tight">{APP_NAME}</span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
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
      </nav>
    </aside>
  );
}