import { lastSynced } from "@/lib/data";

interface PageLayoutProps {
  children: React.ReactNode;
  description?: string;
}

export function PageLayout({ children, description }: PageLayoutProps) {
  return (
    <div className="space-y-8">
      {description && (
        <div className="border-b border-border pb-6">
          <p className="text-sm text-muted-foreground">{description}</p>
          <p className="mt-1 font-mono text-xs text-muted-foreground/60">
            Updated {lastSynced}
          </p>
        </div>
      )}
      {children}
    </div>
  );
}
