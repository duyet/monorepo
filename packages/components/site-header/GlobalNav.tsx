"use client";

import { cn } from "@duyet/libs/utils";
import { ChevronsUpDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import {
  excludeLocalNavItems,
  filterGlobalNav,
  GLOBAL_NAV,
  isNavActive,
} from "./apps";
import type { AppKey, LocalNavItem } from "./types";

export function GlobalNav({
  currentApp,
  localNav,
  variant = "default",
}: {
  currentApp: AppKey;
  localNav?: LocalNavItem[];
  variant?: "default" | "slashy";
}) {
  const [pathname, setPathname] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isSlashy = variant === "slashy";

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
    <nav
      ref={containerRef}
      className={cn(
        "items-center",
        isSlashy ? "flex gap-0.5" : "hidden gap-0.5 md:flex"
      )}
    >
      {excludeLocalNavItems(
        filterGlobalNav(GLOBAL_NAV, currentApp),
        localNav
      ).map((item) => {
        const hasChildren = item.children && item.children.length > 0;
        const isDropdownOpen = openDropdown === item.label;
        const itemActive =
          isNavActive(item.match, currentApp, pathname) ||
          Boolean(
            item.children?.some((child) =>
              isNavActive(child.match, currentApp, pathname)
            )
          );

        if (isSlashy) {
          if (hasChildren) {
            return (
              <div key={item.href} className="relative">
                <button
                  type="button"
                  className={cn("site-header-link", itemActive && "is-active")}
                  onClick={() =>
                    setOpenDropdown(isDropdownOpen ? null : item.label)
                  }
                  aria-haspopup="menu"
                  aria-expanded={isDropdownOpen}
                >
                  {item.label}
                  <ChevronsUpDown aria-hidden className="ml-1 h-3 w-3 opacity-50" />
                </button>
                {isDropdownOpen ? (
                  <div className="absolute left-0 top-full z-50 mt-2 min-w-[160px] overflow-hidden rounded-xl border border-[var(--rd-border)] bg-[var(--rd-surface)] shadow-xl dark:shadow-black/40">
                    <nav className="flex flex-col p-1.5">
                      {item.children!.map((child) => (
                        <a
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "flex h-8 items-center rounded-lg px-3 text-sm transition-colors",
                            isNavActive(child.match, currentApp, pathname)
                              ? "bg-[var(--rd-surface-2)] text-[var(--rd-text)] font-medium"
                              : "text-[var(--rd-text-2)] hover:bg-[var(--rd-surface-2)] hover:text-[var(--rd-text)]"
                          )}
                        >
                          {child.label}
                        </a>
                      ))}
                    </nav>
                  </div>
                ) : null}
              </div>
            );
          }

          return (
            <a
              key={item.href}
              href={item.href}
              className={cn("site-header-link", itemActive && "is-active")}
              {...(item.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {item.label}
            </a>
          );
        }

        return (
          <div key={item.href} className="relative">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-2.5 text-sm font-normal text-muted-foreground hover:text-foreground",
                itemActive &&
                  "bg-muted font-medium text-[var(--rd-accent)] hover:text-[var(--rd-accent)]"
              )}
              onClick={
                hasChildren
                  ? () => setOpenDropdown(isDropdownOpen ? null : item.label)
                  : undefined
              }
              aria-haspopup={hasChildren ? "menu" : undefined}
              aria-expanded={hasChildren ? isDropdownOpen : undefined}
              asChild={!hasChildren}
            >
              {hasChildren ? (
                <span className="flex items-center gap-1">
                  {item.label}
                  <ChevronsUpDown aria-hidden className="h-3 w-3" />
                </span>
              ) : (
                <a
                  href={item.href}
                  {...(item.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  <span className="flex items-center gap-1.5">
                    {item.Icon && (
                      <item.Icon aria-hidden className="h-3.5 w-3.5" />
                    )}
                    {item.label}
                  </span>
                </a>
              )}
            </Button>

            {hasChildren && isDropdownOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 min-w-[160px] overflow-hidden rounded-lg border border-[var(--rd-border)] bg-[var(--rd-bg)] shadow-xl dark:shadow-black/30">
                <nav className="flex flex-col p-1">
                  {item.children!.map((child) => (
                    <a
                      key={child.href}
                      href={child.href}
                      className={cn(
                        "flex items-center h-8 px-3 rounded-md text-sm transition-colors",
                        isNavActive(child.match, currentApp, pathname)
                          ? "bg-[var(--rd-muted)] text-[var(--rd-accent)] font-medium"
                          : "text-[var(--rd-text)] hover:bg-[var(--rd-muted)]"
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
