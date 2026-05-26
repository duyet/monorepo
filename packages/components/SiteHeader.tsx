"use client";

import { cn } from "@duyet/libs/utils";
import {
  Activity,
  BookOpen,
  Camera,
  Check,
  ChevronsUpDown,
  GraduationCap,
  House,
  type LucideIcon,
  Moon,
  Percent,
  Server,
  Sparkles,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Separator } from "./ui/separator";

export interface SiteHeaderProps {
  /** @deprecated use currentApp instead */
  brand?: string;
  /** @deprecated use currentApp instead */
  brandHref?: string;
  /** One of the known app keys. Defaults to "home". */
  currentApp?: AppKey;
  /** Inline nav items rendered after the app switcher separator. */
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
  | "ai-percentage"
  | "kb";

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
    key: "ai-percentage",
    name: "AI Percentage",
    href: "https://ai-percentage.duyet.net",
    subdomain: "ai-percentage.duyet.net",
    Icon: Percent,
  },
  {
    key: "kb",
    name: "KB",
    href: "https://kb.duyet.net",
    subdomain: "kb.duyet.net",
    Icon: GraduationCap,
  },
];

function AppLogo({ Icon }: { Icon: LucideIcon }) {
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
      <Icon className="h-3.5 w-3.5" strokeWidth={2} />
    </div>
  );
}

function AppSwitcher({ currentApp = "home" }: { currentApp?: AppKey }) {
  const current = APPS.find((a) => a.key === currentApp) ?? APPS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 px-2">
          <AppLogo Icon={current.Icon} />
          <span className="text-sm font-semibold">{current.name}</span>
          <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72">
        <DropdownMenuLabel>Apps</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {APPS.map((app) => (
          <DropdownMenuItem
            key={app.key}
            className="flex items-center gap-3 py-2"
            onClick={() => {
              window.location.href = app.href;
            }}
          >
            <AppLogo Icon={app.Icon} />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-sm font-medium">{app.name}</span>
              <span className="text-xs font-mono text-muted-foreground">
                {app.subdomain}
              </span>
            </div>
            {app.key === currentApp && (
              <Check className="h-4 w-4 shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
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
    if (activeHref === href) return true;
    if (href === "/") return false;
    return activeHref.startsWith(`${href}/`);
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
      <div className="mx-auto flex h-14 max-w-[1200px] items-center px-4 sm:px-6 lg:px-8">
        <AppSwitcher currentApp={currentApp} />
        {localNav && localNav.length > 0 && (
          <LocalNav items={localNav} activeHref={activeHref} />
        )}
        <div className="ml-auto flex items-center gap-1">
          <ThemeButton />
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;
