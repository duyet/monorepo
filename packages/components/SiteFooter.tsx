import { cn } from "@duyet/libs/utils";
import type { ReactNode } from "react";

export interface SiteFooterLink {
  label: string;
  href: string;
}

export interface SiteFooterProps {
  links?: SiteFooterLink[];
  owner?: string;
  className?: string;
  children?: ReactNode;
}

const DEFAULT_LINKS: SiteFooterLink[] = [
  { label: "GitHub", href: "https://github.com/duyet" },
  { label: "Blog", href: "https://blog.duyet.net" },
  { label: "CV", href: "https://cv.duyet.net" },
];

export function SiteFooter({
  links = DEFAULT_LINKS,
  owner = "duyet",
  className,
  children,
}: SiteFooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer className={cn("border-t", className)}>
      <div className="mx-auto flex h-14 max-w-screen-2xl flex-col items-center justify-between gap-2 px-4 text-sm text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
        <p>
          © {year} {owner}
        </p>
        <nav className="flex items-center gap-4">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>
        {children}
      </div>
    </footer>
  );
}

export default SiteFooter;
