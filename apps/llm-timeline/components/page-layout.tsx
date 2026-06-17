import { Eyebrow } from "@duyet/components";
import { lastSynced } from "@/lib/data";

interface PageLayoutProps {
  children: React.ReactNode;
  description?: string;
}

export function PageLayout({ children, description }: PageLayoutProps) {
  return (
    <div className="space-y-8">
      {description && (
        <header className="border-b border-[var(--rd-line)] pb-6 pt-[clamp(6px,1.5vw,16px)]">
          <Eyebrow>LLM TIMELINE</Eyebrow>
          <p className="rd-lead mt-3 max-w-[60ch] text-[clamp(0.96rem,1.15vw,1.06rem)]">
            {description}
          </p>
          <p className="mt-2 font-[family-name:var(--font-mono)] text-xs text-[var(--rd-text-3)]">
            Updated {lastSynced}
          </p>
        </header>
      )}
      {children}
    </div>
  );
}
