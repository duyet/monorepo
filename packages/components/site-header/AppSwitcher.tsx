"use client";

import { cn } from "@duyet/libs/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  type CSSProperties,
  useEffect,
  useRef,
  useState,
} from "react";
import { APPS, CATEGORY_ORDER } from "./apps";
import { twHeader } from "./tw";
import type { AppCategory, AppIcon, AppKey } from "./types";

function dither(svg: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const CATEGORY_THEME: Record<
  AppCategory,
  { tone: string; dither: string }
> = {
  Personal: {
    tone: "#b8734a",
    dither: dither(
      `<svg xmlns="http://www.w3.org/2000/svg" width="7" height="7"><circle cx="1.2" cy="2" r=".7" fill="#b8734a"/><circle cx="5" cy="5.2" r=".55" fill="#b8734a" opacity=".7"/><circle cx="4.5" cy="1.2" r=".45" fill="#b8734a" opacity=".5"/></svg>`
    ),
  },
  "AI & Data": {
    tone: "#4a6d92",
    dither: dither(
      `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="1.2" height="1.2" fill="#4a6d92"/><rect x="4" y="3" width="1" height="1" fill="#4a6d92" opacity=".7"/><rect x="6.5" y="6.5" width="1.1" height="1.1" fill="#4a6d92" opacity=".55"/><rect x="2" y="6" width=".8" height=".8" fill="#4a6d92" opacity=".45"/></svg>`
    ),
  },
  Build: {
    tone: "#7a4560",
    dither: dither(
      `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><path d="M0 7 L7 0" stroke="#7a4560" stroke-width=".7"/><path d="M3 8 L8 3" stroke="#7a4560" stroke-width=".5" opacity=".55"/></svg>`
    ),
  },
  Infra: {
    tone: "#2f6a4c",
    dither: dither(
      `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect y="1" width="8" height=".7" fill="#2f6a4c" opacity=".55"/><rect y="4.5" width="8" height=".5" fill="#2f6a4c" opacity=".35"/><circle cx="2" cy="6.6" r=".5" fill="#2f6a4c"/></svg>`
    ),
  },
};

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
              const theme = CATEGORY_THEME[category];
              return (
                <div
                  key={category}
                  className="mb-1.5 rounded-md last:mb-0"
                  style={
                    {
                      "--switcher-tone": theme.tone,
                      "--switcher-dither": theme.dither,
                    } as CSSProperties
                  }
                >
                  <p className="px-1.5 pt-1 pb-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-[color-mix(in_srgb,var(--switcher-tone)_72%,var(--rd-text-3))]">
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
                            "hover:-translate-y-px hover:shadow-[0_8px_20px_-12px_color-mix(in_srgb,var(--switcher-tone)_55%,transparent)]",
                            "before:pointer-events-none before:absolute before:inset-0 before:z-0 before:opacity-0 before:transition-opacity before:duration-200",
                            "before:bg-[radial-gradient(100px_circle_at_var(--mx,30%)_var(--my,30%),color-mix(in_srgb,var(--switcher-tone)_38%,transparent),transparent_70%)]",
                            "hover:before:opacity-100 focus-visible:before:opacity-100",
                            "after:pointer-events-none after:absolute after:inset-0 after:z-0 after:opacity-0 after:transition-opacity after:duration-200",
                            "after:[background-image:var(--switcher-dither)] after:bg-repeat after:[mask-image:linear-gradient(105deg,transparent_0%,transparent_42%,black_88%)]",
                            "hover:after:opacity-30 focus-visible:after:opacity-30",
                            isCurrent
                              ? "border-[color-mix(in_srgb,var(--switcher-tone)_28%,transparent)] bg-[color-mix(in_srgb,var(--switcher-tone)_10%,var(--rd-muted,transparent))]"
                              : "border-transparent hover:border-[color-mix(in_srgb,var(--switcher-tone)_45%,transparent)] hover:bg-[color-mix(in_srgb,var(--switcher-tone)_8%,transparent)]",
                          )}
                        >
                          <span
                            className={cn(
                              "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border bg-background",
                              "transition-transform duration-200 ease-out",
                              "group-hover:scale-110 group-hover:-rotate-6 group-hover:border-[color-mix(in_srgb,var(--switcher-tone)_50%,transparent)]",
                              isCurrent
                                ? "border-[color-mix(in_srgb,var(--switcher-tone)_35%,transparent)]"
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
