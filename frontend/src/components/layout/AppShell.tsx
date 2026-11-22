import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';

export function AppShell() {
  return (
    <div className="flex min-h-dvh bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 pb-20 md:pb-0">
          <div className="mx-auto w-full max-w-6xl p-4 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}