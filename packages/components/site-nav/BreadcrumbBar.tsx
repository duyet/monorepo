"use client";

import { cn } from "@duyet/libs/utils";
import * as React from "react";

export interface BreadcrumbItem {
  name: string;
  href?: string;
}

export interface BreadcrumbBarProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function BreadcrumbBar({ items, className }: BreadcrumbBarProps) {
  if (!items || items.length === 0) return null;

  return (
    <div
      className={cn(
        "h-10 w-full border-b border-neutral-200/50 bg-white/70 backdrop-blur-md dark:border-white/5 dark:bg-[#0a0a0a]/70",
        className
      )}
    >
      <div className="mx-auto flex h-full max-w-[1200px] items-center px-5 text-xs font-medium text-neutral-600 dark:text-neutral-400 sm:px-8 lg:px-10">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2">
          {items.map((item, idx) => {
            const isLast = idx === items.length - 1;
            return (
              <React.Fragment key={item.name + idx}>
                {idx > 0 && (
                  <span
                    className="text-neutral-300 dark:text-neutral-700"
                    aria-hidden="true"
                  >
                    ·
                  </span>
                )}
                {isLast ? (
                  <span
                    className="text-neutral-400 dark:text-neutral-500 truncate max-w-[200px]"
                    aria-current="page"
                  >
                    {item.name}
                  </span>
                ) : item.href ? (
                  <a
                    href={item.href}
                    className="hover:text-neutral-900 dark:hover:text-white transition-colors"
                  >
                    {item.name}
                  </a>
                ) : (
                  <span>{item.name}</span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
