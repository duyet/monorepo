"use client";

import { cn } from "@duyet/libs/utils";
import { Check, ChevronsUpDown, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Badge } from "./ui/badge";
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
  initials: string;
  description: string;
};

const APPS: AppDef[] = [
  {
    key: "home",
    name: "Home",
    href: "https://duyet.net",
    initials: "HM",
    description: "Personal homepage",
  },
  {
    key: "blog",
    name: "Blog",
    href: "https://blog.duyet.net",
    initials: "BL",
    description: "Writing and notes",
  },
  {
    key: "insights",
    name: "Insights",
    href: "https://insights.duyet.net",
    initials: "IN",
    description: "Live telemetry",
  },
  {
    key: "llm-timeline",
    name: "LLM Timeline",
    href: "https://llm-timeline.duyet.net",
    initials: "LT",
    description: "LLM release timeline",
  },
  {
    key: "homelab",
    name: "Homelab",
    href: "https://homelab.duyet.net",
    initials: "HL",
    description: "Cluster & devices",
  },
  {
    key: "photos",
    name: "Photos",
    href: "https://photos.duyet.net",
    initials: "PH",
    description: "Photography",
  },
  {
    key: "ai-percentage",
    name: "AI Percentage",
    href: "https://ai-percentage.duyet.net",
    initials: "AI",
    description: "AI commit share",
  },
  {
    key: "kb",
    name: "KB",
    href: "https://kb.duyet.net",
    initials: "KB",
    description: "Knowledge base",
  },
];

function AppInitialsAvatar({ initials }: { initials: string }) {
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] font-semibold">
      {initials}
    </div>
  );
}

function AppSwitcher({ currentApp = "home" }: { currentApp?: AppKey }) {
  const current = APPS.find((a) => a.key === currentApp) ?? APPS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 px-2">
          <AppInitialsAvatar initials={current.initials} />
          <span className="text-sm font-semibold">{current.name}</span>
          <Badge variant="secondary" className="text-[10px]">
            OSS
          </Badge>
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
            <AppInitialsAvatar initials={app.initials} />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-sm font-medium">{app.name}</span>
              <span className="text-xs text-muted-foreground">
                {app.description}
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

  return (
    <>
      <Separator orientation="vertical" className="mx-2 h-6" />
      <nav className="flex items-center gap-0.5">
        {items.map((item) => {
          const isActive = activeHref === item.href;
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

function ClerkUserArea() {
  const [clerkModule, setClerkModule] = useState<{
    SignedIn: React.ComponentType<{ children: React.ReactNode }>;
    SignedOut: React.ComponentType<{ children: React.ReactNode }>;
    UserButton: React.ComponentType<{ afterSignOutUrl?: string }>;
    SignInButton: React.ComponentType<{
      mode?: string;
      children: React.ReactNode;
    }>;
  } | null>(null);

  const publishableKey =
    typeof import.meta !== "undefined"
      ? (
          (import.meta as unknown as Record<string, unknown>).env as
            | Record<string, string>
            | undefined
        )?.VITE_CLERK_PUBLISHABLE_KEY
      : undefined;

  useEffect(() => {
    if (!publishableKey) return;
    import("@clerk/clerk-react")
      .then((mod) => setClerkModule(mod as typeof clerkModule))
      .catch(() => {
        // Clerk unavailable — render nothing
      });
  }, [publishableKey]);

  if (!clerkModule) return null;

  const { SignedIn, SignedOut, UserButton, SignInButton } = clerkModule;

  return (
    <>
      <SignedIn>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal">
          <Button variant="ghost" size="sm">
            Sign in
          </Button>
        </SignInButton>
      </SignedOut>
    </>
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
          <ClerkUserArea />
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;
