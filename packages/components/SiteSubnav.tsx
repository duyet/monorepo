"use client";

import { cn } from "@duyet/libs/utils";
import type { ReactNode } from "react";

export interface SiteSubnavLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface SiteSubnavProps {
  links?: SiteSubnavLink[];
  activeHref?: string;
  className?: string;
  children?: ReactNode;
}

export function SiteSubnav({
  links,
  activeHref,
  className,
  children,
}: SiteSubnavProps) {
  if (!links?.length && !children) return null;

  return (
    <div className={cn("border-b bg-background", className)}>
      <div className="mx-auto flex h-12 max-w-[1200px] items-center gap-1 overflow-x-auto px-2 sm:px-4 lg:px-6">
        {links?.map((link) => {
          const active = activeHref === link.href;
          return (
            <a
              key={link.href}
              href={link.href}
              {...(link.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-sm transition-colors",
                active
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {link.label}
            </a>
          );
        })}
        {children}
      </div>
    </div>
  );
}

export default SiteSubnav;
