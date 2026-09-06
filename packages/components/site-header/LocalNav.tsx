import { cn } from "@duyet/libs/utils";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import type { LocalNavItem } from "./types";

export function LocalNav({
  items,
  activeHref,
  variant = "default",
}: {
  items: LocalNavItem[];
  activeHref?: string;
  variant?: "default" | "slashy";
}) {
  if (items.length === 0) return null;

  const matches = (href: string) => {
    if (!activeHref) return false;
    const path = activeHref.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
    const target = href.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
    if (path === target) return true;
    if (target === "/") return false;
    return path.startsWith(`${target}/`);
  };

  if (variant === "slashy") {
    return (
      <nav className="flex items-center gap-0.5">
        {items.map((item) => {
          const isActive = matches(item.href);
          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "site-header-link",
                isActive && "is-active"
              )}
              {...(item.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {item.label}
            </a>
          );
        })}
      </nav>
    );
  }

  return (
    <div className="hidden items-center md:flex">
      <Separator orientation="vertical" className="mx-2 h-6" />
      <nav className="flex items-center gap-0.5">
        {items.map((item) => {
          const isActive = matches(item.href);
          return (
            <Button
              key={item.href}
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-2.5 text-sm",
                isActive && "bg-muted font-medium text-[var(--rd-accent)]"
              )}
              asChild
            >
              <a
                href={item.href}
                {...(item.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {item.label}
              </a>
            </Button>
          );
        })}
      </nav>
    </div>
  );
}
