"use client";

import { cn } from "@duyet/libs/utils";
import { Check, ChevronsUpDown, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { APPS, CATEGORY_ORDER } from "./apps";
import type { AppKey } from "./types";

function AppLogo({ Icon }: { Icon: LucideIcon }) {
  return (
    <Icon
      className="h-4 w-4 shrink-0 text-foreground"
      strokeWidth={1.75}
      aria-hidden
    />
  );
}

export function AppSwitcher({
  currentApp = "home",
}: {
  currentApp?: AppKey;
}) {
  const current = APPS.find((a) => a.key === currentApp) ?? APPS[0];
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onDocPointerDown(e: PointerEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onDocPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDocPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "inline-flex h-9 items-center gap-2 -ml-1 rounded-md px-2 text-sm font-medium",
          "transition-colors hover:bg-muted/60 focus-visible:outline-hidden",
          "focus-visible:ring-2 focus-visible:ring-ring",
          open && "bg-muted/60 relative z-50",
        )}
      >
        <AppLogo Icon={current.Icon} />
        <span className="font-semibold tracking-tight">{current.name}</span>
        <ChevronsUpDown
          aria-hidden
          className={cn(
            "h-3.5 w-3.5 text-muted-foreground/70 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}

      {open && (
        <div
          role="menu"
          className={cn(
            "absolute left-0 top-full z-50 mt-1.5 w-[min(92vw,26rem)] overflow-hidden rounded-lg border border-[var(--rd-border)] bg-[var(--rd-bg)] shadow-xl",
            "dark:shadow-black/30",
          )}
        >
          <div className="max-h-[min(85vh,45rem)] overflow-y-auto p-1.5">
            {CATEGORY_ORDER.map((category) => {
              const apps = APPS.filter((a) => a.category === category);
              if (apps.length === 0) return null;
              return (
                <div key={category} className="mb-1.5 last:mb-0">
                  <p className="px-1.5 pt-1 pb-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
                    {category}
                  </p>
                  <div className="grid grid-cols-2 gap-1">
                    {apps.map((app) => {
                      const isCurrent = app.key === currentApp;
                      return (
                        <a
                          key={app.key}
                          href={app.href}
                          role="menuitem"
                          aria-current={isCurrent ? "page" : undefined}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "group flex items-center gap-2.5 rounded-md border px-2 py-2 outline-none transition-colors",
                            "hover:bg-[var(--rd-muted)] focus-visible:bg-[var(--rd-muted)]",
                            isCurrent
                              ? "border-foreground/20 bg-[var(--rd-muted)]"
                              : "border-transparent hover:border-border",
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-colors",
                              "border-border bg-background group-hover:border-foreground/20",
                              isCurrent && "border-foreground/20",
                            )}
                          >
                            <AppLogo Icon={app.Icon} />
                          </span>
                          <span className="flex min-w-0 flex-1 flex-col leading-tight">
                            <span className="flex items-center gap-1">
                              <span className="truncate text-[13px] font-medium text-foreground">
                                {app.name}
                              </span>
                              {isCurrent && (
                                <Check
                                  aria-hidden
                                  className="h-3 w-3 shrink-0 text-foreground"
                                />
                              )}
                            </span>
                            <span className="truncate text-[11px] text-muted-foreground/80">
                              {app.blurb}
                            </span>
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
