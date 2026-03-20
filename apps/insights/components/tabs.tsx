"use client";

import { cn } from "@duyet/libs/utils";
import { Link, useRouterState } from "@tanstack/react-router";

export function Tabs({ tabs }: { tabs: { text: string; href: string }[] }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="mb-4 flex items-center">
      {tabs.map(({ text, href }) => (
        <Link
          className={cn(
            "flex h-7 items-center justify-center rounded-full px-4 text-center text-sm text-muted-foreground transition-colors hover:text-primary",
            pathname === href
              ? "bg-muted font-bold text-primary"
              : "text-muted-foreground"
          )}
          to={href}
          key={href}
        >
          {text}
        </Link>
      ))}
    </div>
  );
}
