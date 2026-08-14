"use client";

import { cn } from "@duyet/libs/utils";
import { ChevronsUpDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { filterGlobalNav, GLOBAL_NAV, isNavActive } from "./apps";
import type { AppKey } from "./types";

export function GlobalNav({ currentApp }: { currentApp: AppKey }) {
  const [pathname, setPathname] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setPathname(window.location.pathname.replace(/\/+$/, "") || "/");
  }, []);

  useEffect(() => {
    if (!openDropdown) return;
    const onPointerDown = (e: PointerEvent) => {
      if (
        !containerRef.current ||
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [openDropdown]);

  return (
    <nav ref={containerRef} className="hidden items-center gap-0.5 md:flex">
      {filterGlobalNav(GLOBAL_NAV, currentApp).map((item) => {
        const hasChildren = item.children && item.children.length > 0;
        const isDropdownOpen = openDropdown === item.label;
        const itemActive =
          isNavActive(item.match, currentApp, pathname) ||
          Boolean(item.children?.some((child) =>
            isNavActive(child.match, currentApp, pathname),
          ));

        return (
          <div key={item.href} className="relative">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-2.5 text-sm font-normal text-muted-foreground hover:text-foreground",
                itemActive &&
                  "bg-muted font-medium text-[var(--rd-accent)] hover:text-[var(--rd-accent)]",
              )}
              onClick={
                hasChildren
                  ? () => setOpenDropdown(isDropdownOpen ? null : item.label)
                  : undefined
              }
              asChild={!hasChildren}
            >
              {hasChildren ? (
                <span className="flex items-center gap-1">
                  {item.label}
                  <ChevronsUpDown aria-hidden className="h-3 w-3" />
                </span>
              ) : (
                <a href={item.href}>{item.label}</a>
              )}
            </Button>

            {hasChildren && isDropdownOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 min-w-[160px] overflow-hidden rounded-lg border bg-[var(--rd-bg)] shadow-xl dark:shadow-black/30">
                <nav className="flex flex-col p-1">
                  {item.children!.map((child) => (
                    <a
                      key={child.href}
                      href={child.href}
                      className={cn(
                        "flex items-center h-8 px-3 rounded-md text-sm transition-colors",
                        isNavActive(child.match, currentApp, pathname)
                          ? "bg-[var(--rd-muted)] text-[var(--rd-accent)] font-medium"
                          : "text-[var(--rd-text)] hover:bg-[var(--rd-muted)]",
                      )}
                    >
                      {child.label}
                    </a>
                  ))}
                </nav>
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
