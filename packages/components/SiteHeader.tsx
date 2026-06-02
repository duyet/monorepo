"use client";

import { cn } from "@duyet/libs/utils";
import {
  Activity,
  BookOpen,
  Bot,
  Brain,
  Briefcase,
  Camera,
  Check,
  ChevronsUpDown,
  Code2,
  FileText,
  Flame,
  House,
  List,
  type LucideIcon,
  Moon,
  Percent,
  Plug,
  Server,
  Sparkles,
  Sun,
  User,
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
  | "about"
  | "projects"
  | "ls"
  | "blog"
  | "insights"
  | "llm-timeline"
  | "homelab"
  | "photos"
  | "kb"
  | "ai-percentage"
  | "agents"
  | "burn"
  | "cv"
  | "html"
  | "mcp";

type AppCategory = "Personal" | "AI & Data" | "Build" | "Infra";

type AppDef = {
  key: AppKey;
  name: string;
  href: string;
  subdomain: string;
  Icon: LucideIcon;
  category: AppCategory;
  /** One-line insight shown under the name in the switcher. */
  blurb: string;
};

/** Render order for the grouped switcher sections. */
const CATEGORY_ORDER: AppCategory[] = [
  "Personal",
  "AI & Data",
  "Build",
  "Infra",
];

const APPS: AppDef[] = [
  {
    key: "home",
    name: "Home",
    href: "https://duyet.net",
    subdomain: "duyet.net",
    Icon: House,
    category: "Personal",
    blurb: "Profile & projects",
  },
  {
    key: "blog",
    name: "Blog",
    href: "https://blog.duyet.net",
    subdomain: "blog.duyet.net",
    Icon: BookOpen,
    category: "Personal",
    blurb: "Notes & posts",
  },
  {
    key: "photos",
    name: "Photos",
    href: "https://photos.duyet.net",
    subdomain: "photos.duyet.net",
    Icon: Camera,
    category: "Personal",
    blurb: "Photography",
  },
  {
    key: "about",
    name: "About",
    href: "https://duyet.net/about",
    subdomain: "duyet.net",
    Icon: User,
    category: "Personal",
    blurb: "Bio & background",
  },
  {
    key: "projects",
    name: "Projects",
    href: "https://duyet.net/projects",
    subdomain: "duyet.net",
    Icon: Briefcase,
    category: "Personal",
    blurb: "Work & experiments",
  },
  {
    key: "ls",
    name: "ls",
    href: "https://duyet.net/ls",
    subdomain: "duyet.net",
    Icon: List,
    category: "Personal",
    blurb: "Directory listing",
  },
  {
    key: "cv",
    name: "CV",
    href: "https://cv.duyet.net",
    subdomain: "cv.duyet.net",
    Icon: FileText,
    category: "Personal",
    blurb: "Resume",
  },
  {
    key: "insights",
    name: "Insights",
    href: "https://insights.duyet.net",
    subdomain: "insights.duyet.net",
    Icon: Activity,
    category: "AI & Data",
    blurb: "Usage analytics",
  },
  {
    key: "llm-timeline",
    name: "LLM Timeline",
    href: "https://llm-timeline.duyet.net",
    subdomain: "llm-timeline.duyet.net",
    Icon: Sparkles,
    category: "AI & Data",
    blurb: "3,900+ models",
  },
  {
    key: "ai-percentage",
    name: "AI Percentage",
    href: "https://ai-percentage.duyet.net",
    subdomain: "ai-percentage.duyet.net",
    Icon: Percent,
    category: "AI & Data",
    blurb: "AI-written share",
  },
  {
    key: "burn",
    name: "Burn",
    href: "https://burn.duyet.net",
    subdomain: "burn.duyet.net",
    Icon: Flame,
    category: "AI & Data",
    blurb: "Token spend",
  },
  {
    key: "agents",
    name: "Agents",
    href: "https://agents.duyet.net",
    subdomain: "agents.duyet.net",
    Icon: Bot,
    category: "Build",
    blurb: "AI chat & tools",
  },
  {
    key: "kb",
    name: "Knowledge base",
    href: "https://kb.duyet.net",
    subdomain: "kb.duyet.net",
    Icon: Brain,
    category: "Build",
    blurb: "Second brain",
  },
  {
    key: "html",
    name: "HTML",
    href: "https://html.duyet.net",
    subdomain: "html.duyet.net",
    Icon: Code2,
    category: "Build",
    blurb: "HTML artifacts",
  },
  {
    key: "mcp",
    name: "MCP",
    href: "https://mcp.duyet.net",
    subdomain: "mcp.duyet.net",
    Icon: Plug,
    category: "Build",
    blurb: "MCP server",
  },
  {
    key: "homelab",
    name: "Homelab",
    href: "https://homelab.duyet.net",
    subdomain: "homelab.duyet.net",
    Icon: Server,
    category: "Infra",
    blurb: "Cluster status",
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
            "absolute left-0 top-full z-50 mt-1.5 w-[min(92vw,26rem)] overflow-hidden rounded-lg border bg-popover shadow-none",
          )}
        >
          <div className="max-h-[min(72vh,34rem)] overflow-y-auto p-1.5">
            {CATEGORY_ORDER.map((category) => {
              const apps = APPS.filter((a) => a.category === category);
              if (apps.length === 0) return null;
              return (
                <div key={category} className="mb-1.5 last:mb-0">
                  <p className="px-1.5 pt-1 pb-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
                    {category}
                  </p>
                  {/* Compact two-column grid of app tiles */}
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
                            "hover:bg-muted focus-visible:bg-muted",
                            isCurrent
                              ? "border-foreground/20 bg-muted/60"
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
