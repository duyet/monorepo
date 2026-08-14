"use client";

import { cn } from "@duyet/libs/utils";
import { ChevronsUpDown, Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { filterGlobalNav, GLOBAL_NAV, isNavActive } from "./apps";
import type { AppKey } from "./types";

export function MobileNav({ currentApp }: { currentApp: AppKey }) {
  const [open, setOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (
        !containerRef.current ||
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setOpenDropdown(null);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const pathname =
    typeof window === "undefined"
      ? null
      : window.location.pathname.replace(/\/+$/, "") || "/";

  return (
    <div ref={containerRef} className="relative md:hidden">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open menu"
        aria-expanded={open}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-1 w-40 overflow-hidden rounded-lg border bg-[var(--rd-bg)] shadow-xl dark:shadow-black/30"
        >
          <nav className="flex flex-col p-1">
            {filterGlobalNav(GLOBAL_NAV, currentApp).map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const isDropdownOpen = openDropdown === item.label;
              const itemActive =
                isNavActive(item.match, currentApp, pathname) ||
                Boolean(
                  item.children?.some((child) =>
                    isNavActive(child.match, currentApp, pathname),
                  ),
                );

              return (
                <div key={item.href}>
                  <a
                    href={hasChildren ? undefined : item.href}
                    role="menuitem"
                    onClick={(e) => {
                      if (hasChildren) {
                        e.preventDefault();
                        setOpenDropdown(isDropdownOpen ? null : item.label);
                      } else {
                        setOpen(false);
                      }
                    }}
                    className={cn(
                      "flex items-center justify-between h-9 px-3 rounded-md text-sm font-medium transition-colors",
                      itemActive
                        ? "bg-[var(--rd-muted)] text-[var(--rd-accent)]"
                        : "text-[var(--rd-text-3)] hover:bg-[var(--rd-muted)] hover:text-[var(--rd-text)]",
                    )}
                  >
                    {item.label}
                    {hasChildren && (
                      <ChevronsUpDown
                        aria-hidden
                        className={cn(
                          "h-3 w-3 shrink-0 transition-transform",
                          isDropdownOpen && "rotate-180",
                        )}
                      />
                    )}
                  </a>
                  {hasChildren && isDropdownOpen && (
                    <div className="mt-1 flex flex-col pl-3">
                      {item.children!.map((child) => (
                        <a
                          key={child.href}
                          href={child.href}
                          role="menuitem"
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex items-center h-8 px-3 rounded-md text-sm transition-colors",
                            isNavActive(child.match, currentApp, pathname)
                              ? "text-[var(--rd-accent)] font-medium"
                              : "text-[var(--rd-text)] hover:bg-[var(--rd-muted)]",
                          )}
                        >
                          {child.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}
