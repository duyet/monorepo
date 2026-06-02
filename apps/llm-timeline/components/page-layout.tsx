import { lastSynced } from "@/lib/data";

interface PageLayoutProps {
  children: React.ReactNode;
  description?: string;
}

export function PageLayout({ children, description }: PageLayoutProps) {
  return (
    <div className="space-y-8">
      {description && (
        <div className="border-b border-[var(--rd-line)] pb-6">
          <p className="text-sm text-[var(--rd-text-2)]">{description}</p>
          <p className="mt-1 font-[family-name:var(--font-mono)] text-xs text-[var(--rd-text-3)]">
            Updated {lastSynced}
          </p>
        </div>
      )}
      {children}
    </div>
  );
}
