import { cn } from "~/lib/utils";
import { ThemeToggle } from "~/components/ThemeToggle";

interface NavLink {
  name: string;
  href: string;
  active?: boolean;
}

interface SiteNavProps {
  brandText?: string;
  brandHref?: string;
  links?: NavLink[];
  className?: string;
}

export function SiteNav({
  brandText = "duyet.net",
  brandHref = "https://duyet.net",
  links = [],
  className,
}: SiteNavProps) {
  return (
    <header
      className={cn(
        "h-12 w-full border-b border-border bg-background",
        className
      )}
    >
      <div className="mx-auto flex h-full max-w-[760px] items-center justify-between px-5 sm:px-8">
        <div className="flex items-center gap-6 h-full">
          <a
            href={brandHref}
            className="text-sm font-semibold tracking-tight text-foreground"
          >
            {brandText}
          </a>

          {links.length > 0 && (
            <nav aria-label="Primary" className="hidden items-center gap-5 md:flex h-full">
              {links.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  aria-current={link.active ? "page" : undefined}
                  className={cn(
                    "text-xs font-medium tracking-tight transition-colors",
                    link.active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.name}
                </a>
              ))}
            </nav>
          )}
        </div>

        <ThemeToggle />
      </div>
    </header>
  );
}
