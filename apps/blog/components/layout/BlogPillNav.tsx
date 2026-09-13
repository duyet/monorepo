import { cn } from "@duyet/libs/utils";
import { Link } from "@tanstack/react-router";

export interface PillNavItem {
  label: string;
  href: string;
  count?: number;
  isActive?: boolean;
}

interface BlogPillNavProps {
  items: PillNavItem[];
  className?: string;
}

const pill =
  "inline-flex items-center gap-2 rounded-[var(--rd-r-sm)] border border-[var(--rd-border)] bg-[var(--rd-surface)] px-3 py-1.5 text-[13px] text-[var(--rd-text-3)] no-underline transition-colors hover:border-[var(--rd-text)] hover:text-[var(--rd-text)]";
const pillActive =
  "border-[var(--rd-text)] bg-[var(--rd-surface-2)] text-[var(--rd-text)]";

export function BlogPillNav({ items, className }: BlogPillNavProps) {
  return (
    <nav className={cn("flex flex-wrap gap-2 pt-6", className)}>
      {items.map((item) => {
        const isExternal = item.href.startsWith("http");
        const className = cn(pill, item.isActive && pillActive);
        const label = (
          <>
            {item.label}
            {item.count !== undefined && (
              <span className="font-[family-name:var(--font-mono)] text-[10px] text-[var(--rd-text-3)]">
                {item.count}
              </span>
            )}
          </>
        );

        if (isExternal) {
          return (
            <a key={item.label} href={item.href} className={className}>
              {label}
            </a>
          );
        }

        return (
          <Link key={item.label} to={item.href} className={className}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
