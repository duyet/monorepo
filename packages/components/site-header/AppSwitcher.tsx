"use client";

import { cn } from "@duyet/libs/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { APPS, CATEGORY_ORDER } from "./apps";
import { twHeader } from "./tw";
import type { AppIcon, AppKey } from "./types";

function AppLogo({ Icon }: { Icon: AppIcon }) {
  return (
    <Icon className="h-4 w-4 shrink-0 text-foreground" />
  );
}

export function AppSwitcher({
  currentApp = "home",
  variant = "default",
}: {
  currentApp?: AppKey;
  /** `wordmark` — lowercase brand for slashy marketing chrome. */
  variant?: "default" | "wordmark";
}) {
  const current = APPS.find((a) => a.key === currentApp) ?? APPS[0];
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isWordmark = variant === "wordmark";

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
        aria-label={isWordmark ? "Open apps menu" : undefined}
        className={cn(
          "inline-flex h-9 items-center gap-2 -ml-1 rounded-md px-2 text-sm font-medium",
          "transition-colors focus-visible:outline-hidden",
          "focus-visible:ring-2 focus-visible:ring-ring",
          isWordmark
            ? "hover:opacity-80"
            : "hover:bg-muted/60",
          open && !isWordmark && "bg-muted/60 relative z-50",
          open && isWordmark && "relative z-50"
        )}
      >
        {isWordmark ? (
          <>
            <span className={twHeader.wordmark}>duyet</span>
            <ChevronsUpDown
              aria-hidden
              className={cn(
                "h-3 w-3 text-[var(--rd-text-3)] transition-transform",
                open && "rotate-180"
              )}
            />
          </>
        ) : (
          <>
            <AppLogo Icon={current.Icon} />
            <span className="font-semibold tracking-tight">{current.name}</span>
            <ChevronsUpDown
              aria-hidden
              className={cn(
                "h-3.5 w-3.5 text-muted-foreground/70 transition-transform",
                open && "rotate-180"
              )}
            />
          </>
        )}
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
                          onMouseMove={(e) => {
                            const el = e.currentTarget;
                            const r = el.getBoundingClientRect();
                            el.style.setProperty(
                              "--mx",
                              `${e.clientX - r.left}px`
                            );
                            el.style.setProperty(
                              "--my",
                              `${e.clientY - r.top}px`
                            );
                          }}
                          className={cn(
                            "group relative isolate flex items-center gap-2.5 overflow-hidden rounded-md border px-2 py-2 outline-none",
                            "transition-[transform,border-color,box-shadow] duration-200",
                            "hover:-translate-y-px hover:shadow-[0_8px_20px_-12px_rgb(0_0_0_/_0.35)]",
                            "before:pointer-events-none before:absolute before:inset-0 before:z-0 before:opacity-0 before:transition-opacity before:duration-200",
                            "before:bg-[radial-gradient(90px_circle_at_var(--mx,30%)_var(--my,30%),color-mix(in_srgb,var(--rd-accent)_32%,transparent),transparent_68%)]",
                            "hover:before:opacity-100 focus-visible:before:opacity-100",
                            "after:pointer-events-none after:absolute after:inset-0 after:z-0 after:opacity-0 after:transition-opacity",
                            "after:bg-[linear-gradient(115deg,transparent_35%,color-mix(in_srgb,var(--rd-accent)_18%,transparent)_50%,transparent_65%)]",
                            "after:bg-[length:220%_100%] hover:after:opacity-100 hover:after:animate-[rd-app-shine_0.85s_ease]",
                            isCurrent
                              ? "border-foreground/20 bg-[var(--rd-muted)]"
                              : "border-transparent hover:border-[color-mix(in_srgb,var(--rd-accent)_40%,transparent)]",
                          )}
                        >
                          <span
                            className={cn(
                              "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border bg-background",
                              "transition-transform duration-200 ease-out",
                              "group-hover:scale-110 group-hover:-rotate-6 group-hover:border-[color-mix(in_srgb,var(--rd-accent)_45%,transparent)]",
                              isCurrent
                                ? "border-foreground/20"
                                : "border-border",
                            )}
                          >
                            <AppLogo Icon={app.Icon} />
                          </span>
                          <span className="relative z-10 flex min-w-0 flex-1 flex-col leading-tight">
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
