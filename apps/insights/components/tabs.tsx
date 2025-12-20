"use client";

import { cn } from "@duyet/libs/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Tabs({ tabs }: { tabs: { text: string; href: string }[] }) {
  const pathname = usePathname();

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
          href={href}
          key={href}
        >
          {text}
        </Link>
      ))}
    </div>
  );
}
