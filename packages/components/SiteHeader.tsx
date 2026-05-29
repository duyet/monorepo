"use client";

import { cn } from "@duyet/libs/utils";
import {
  Activity,
  BookOpen,
  Bot,
  Brain,
  Camera,
  Check,
  ChevronsUpDown,
  Code2,
  Flame,
  House,
  type LucideIcon,
  Moon,
  Percent,
  Plug,
  Server,
  Sparkles,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

export interface SiteHeaderProps {
  /** @deprecated use currentApp instead */
  brand?: string;
  /** @deprecated use currentApp instead */
  brandHref?: string;
  /** One of the known app keys. Defaults to "home". */
  currentApp?: AppKey;
  /**
   * Local navigation items within the current app scope.
   * Highlighted, flat, inline navigation for page-subviews.
   */
  localNav?: { label: string; href: string; external?: boolean }[];
  /** The href that should be highlighted in localNav. */
  activeHref?: string;
  className?: string;
}

type AppKey =
  | "home"
  | "blog"
  | "insights"
  | "llm-timeline"
  | "homelab"
  | "photos"
  | "kb"
  | "ai-percentage"
  | "agents"
  | "burn"
  | "html"
  | "mcp";

type AppDef = {
  key: AppKey;
  name: string;
  href: string;
  subdomain: string;
  Icon: LucideIcon;
};

const APPS: AppDef[] = [
  {
    key: "home",
    name: "Home",
    href: "https://duyet.net",
    subdomain: "duyet.net",
    Icon: House,
  },
  {
    key: "blog",
    name: "Blog",
    href: "https://blog.duyet.net",
    subdomain: "blog.duyet.net",
    Icon: BookOpen,
  },
  {
    key: "insights",
    name: "Insights",
    href: "https://insights.duyet.net",
    subdomain: "insights.duyet.net",
    Icon: Activity,
  },
  {
    key: "llm-timeline",
    name: "LLM Timeline",
    href: "https://llm-timeline.duyet.net",
    subdomain: "llm-timeline.duyet.net",
    Icon: Sparkles,
  },
  {
    key: "homelab",
    name: "Homelab",
    href: "https://homelab.duyet.net",
    subdomain: "homelab.duyet.net",
    Icon: Server,
  },
  {
    key: "photos",
    name: "Photos",
    href: "https://photos.duyet.net",
    subdomain: "photos.duyet.net",
    Icon: Camera,
  },
  {
    key: "kb",
    name: "Knowledge base",
    href: "https://kb.duyet.net",
    subdomain: "kb.duyet.net",
    Icon: Brain,
  },
  {
    key: "ai-percentage",
    name: "AI Percentage",
    href: "https://ai-percentage.duyet.net",
    subdomain: "ai-percentage.duyet.net",
    Icon: Percent,
  },
  {
    key: "agents",
    name: "Agents",
    href: "https://agents.duyet.net",
    subdomain: "agents.duyet.net",
    Icon: Bot,
  },
  {
    key: "burn",
    name: "Burn",
    href: "https://burn.duyet.net",
    subdomain: "burn.duyet.net",
    Icon: Flame,
  },
  {
    key: "html",
    name: "HTML",
    href: "https://html.duyet.net",
    subdomain: "html.duyet.net",
    Icon: Code2,
  },
  {
    key: "mcp",
    name: "MCP",
    href: "https://mcp.duyet.net",
    subdomain: "mcp.duyet.net",
    Icon: Plug,
  },
];

/**
 * Top-level cross-app menu. Always visible, independent of the per-app
 * `localNav`. Links point at absolute production URLs so the menu works
 * identically from any sub-app. `match` decides the active highlight:
 * `app` keys compare against `currentApp`; `path` keys compare against the
 * current pathname (only meaningful on the home app).
 */
const GLOBAL_NAV: {
  label: string;
  href: string;
  match: { app?: AppKey; path?: string };
}[] = [
  { label: "Home", href: "https://duyet.net", match: { app: "home", path: "/" } },
  {
    label: "Projects",
    href: "https://duyet.net/projects",
    match: { path: "/projects" },
  },
  { label: "Blog", href: "https://blog.duyet.net", match: { app: "blog" } },
  { label: "CV", href: "https://cv.duyet.net", match: {} },
  { label: "Photos", href: "https://photos.duyet.net", match: { app: "photos" } },
  {
    label: "About",
    href: "https://duyet.net/about",
    match: { path: "/about" },
  },
];

function GlobalNav({ currentApp }: { currentApp: AppKey }) {
  // Pathname is only known on the client; resolve after mount to avoid an
  // SSR/prerender hydration mismatch on the active highlight.
  const [pathname, setPathname] = useState<string | null>(null);
  useEffect(() => {
    setPathname(window.location.pathname.replace(/\/+$/, "") || "/");
  }, []);

  const isActive = (m: { app?: AppKey; path?: string }) => {
    if (m.app && m.app === currentApp) {
      // For the home app, a bare `app` match would light up every home route;
      // defer to the path check when one is provided.
      if (m.app === "home" && m.path) return pathname === m.path;
      return true;
    }
    if (m.path && currentApp === "home" && pathname != null) {
      return m.path === "/" ? pathname === "/" : pathname.startsWith(m.path);
    }
    return false;
  };

  return (
    <nav className="hidden items-center gap-0.5 md:flex">
      {GLOBAL_NAV.map((item) => (
        <Button
          key={item.href}
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 px-2.5 text-sm font-normal text-muted-foreground hover:text-foreground",
            isActive(item.match) && "bg-muted font-medium text-foreground",
          )}
          asChild
        >
          <a href={item.href}>{item.label}</a>
        </Button>
      ))}
    </nav>
  );
}

function AppLogo({ Icon }: { Icon: LucideIcon }) {
  return (
    <Icon
      className="h-4 w-4 shrink-0 text-foreground"
      strokeWidth={1.75}
      aria-hidden
    />
  );
}

function AppSwitcher({ currentApp = "home" }: { currentApp?: AppKey }) {
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
          open && "bg-muted/60",
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
        <div
          role="menu"
          className={cn(
            "absolute left-0 top-full z-50 mt-1.5 w-[min(92vw,32rem)] rounded-lg border bg-popover p-2 shadow-none",
          )}
        >
          <p className="px-1.5 pt-1 pb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Switch app
          </p>
          {/* Bento grid of app cards — flat hairline cells, two columns */}
          <div className="grid grid-cols-2 gap-1.5">
            {APPS.map((app) => {
              const isCurrent = app.key === currentApp;
              return (
                <a
                  key={app.key}
                  href={app.href}
                  role="menuitem"
                  aria-current={isCurrent ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "group relative flex flex-col gap-1.5 rounded-md border p-3 outline-none transition-colors",
                    "hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring",
                    isCurrent ? "border-foreground/30 bg-muted/40" : "border-border",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <AppLogo Icon={app.Icon} />
                    {isCurrent && (
                      <Check
                        aria-hidden
                        className="h-3.5 w-3.5 shrink-0 text-foreground"
                      />
                    )}
                  </div>
                  <div className="flex min-w-0 flex-col leading-tight">
                    <span className="truncate text-sm font-medium text-foreground">
                      {app.name}
                    </span>
                    <span className="truncate text-[11px] font-mono text-muted-foreground/80">
                      {app.subdomain}
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function LocalNav({
  items,
  activeHref,
}: {
  items: { label: string; href: string; external?: boolean }[];
  activeHref?: string;
}) {
  if (items.length === 0) return null;

  const matches = (href: string) => {
    if (!activeHref) return false;
    // Normalize: drop query/hash and trailing slash so "/archives",
    // "/archives/", and "/archives?page=2" all match the "/archives" tab.
    const path = activeHref.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
    const target = href.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
    if (path === target) return true;
    if (target === "/") return false;
    return path.startsWith(`${target}/`);
  };

  return (
    <>
      <Separator orientation="vertical" className="mx-2 h-6" />
      <nav className="flex items-center gap-0.5">
        {items.map((item) => {
          const isActive = matches(item.href);
          return (
            <Button
              key={item.href}
              variant="ghost"
              size="sm"
              className={cn("h-8 px-2.5 text-sm", isActive && "bg-muted")}
              asChild
            >
              <a
                href={item.href}
                {...(item.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {item.label}
              </a>
            </Button>
          );
        })}
      </nav>
    </>
  );
}

function ThemeButton() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

export function SiteHeader({
  currentApp = "home",
  localNav,
  activeHref,
  className,
}: SiteHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className,
      )}
    >
      <div className="mx-auto flex h-14 max-w-[1080px] items-center px-4 sm:px-6 lg:px-8">
        <AppSwitcher currentApp={currentApp} />
        {localNav && localNav.length > 0 && (
          <LocalNav items={localNav} activeHref={activeHref} />
        )}
        <div className="ml-auto flex items-center gap-1">
          <GlobalNav currentApp={currentApp} />
          <Separator orientation="vertical" className="mx-1 hidden h-6 md:block" />
          <ThemeButton />
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;
