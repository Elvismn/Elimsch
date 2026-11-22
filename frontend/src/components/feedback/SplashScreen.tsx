import { Bus } from 'lucide-react';

export function SplashScreen() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Bus className="h-8 w-8" />
        </div>
        <p className="text-sm text-muted-foreground">Loading ElimSch…</p>
      </div>
    </div>
  );
}