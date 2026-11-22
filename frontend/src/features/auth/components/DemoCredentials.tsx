import { ChevronDown, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface Props {
  onFill: (email: string, password: string) => void;
}

const DEMO = { email: 'admin@elimsch.com', password: 'Password123!' };

export function DemoCredentials({ onFill }: Props) {
  return (
    <details className="group rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-muted-foreground">
        <span>Demo credentials</span>
        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
      </summary>

      <div className="mt-2 space-y-2">
        <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Email</span>
          <code className="truncate">{DEMO.email}</code>
          <span className="font-medium text-foreground">Password</span>
          <code>{DEMO.password}</code>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="flex-1"
            onClick={() => onFill(DEMO.email, DEMO.password)}
          >
            Fill in
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={async () => {
              await navigator.clipboard.writeText(`${DEMO.email} / ${DEMO.password}`);
              toast.success('Copied to clipboard');
            }}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </details>
  );
}