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

export function BlogPillNav({ items, className }: BlogPillNavProps) {
  return (
    <nav className={cn("pill-nav", className)}>
      {items.map((item) => {
        const isExternal = item.href.startsWith("http");

        if (isExternal) {
          return (
            <a
              key={item.label}
              href={item.href}
              className={cn(item.isActive && "pill-active")}
            >
              {item.label}
              {item.count !== undefined && (
                <span className="pill-count">{item.count}</span>
              )}
            </a>
          );
        }

        return (
          <Link
            key={item.label}
            to={item.href}
            className={cn(item.isActive && "pill-active")}
          >
            {item.label}
            {item.count !== undefined && (
              <span className="pill-count">{item.count}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
