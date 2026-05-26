"use client";

import { cn } from "@duyet/libs/utils";
import {
  BarChart3,
  Bot,
  Clock,
  FileText,
  Home,
  Image,
  LayoutGrid,
  Moon,
  Server,
  Sun,
  User,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

export interface SiteHeaderProps {
  brand?: string;
  brandHref?: string;
  className?: string;
}

type App = {
  name: string;
  href: string;
  icon: typeof Home;
  description: string;
  span: string;
};

const APPS: App[] = [
  {
    name: "Home",
    href: "https://duyet.net",
    icon: Home,
    description: "Personal homepage and project directory",
    span: "col-span-2 row-span-2",
  },
  {
    name: "Blog",
    href: "https://blog.duyet.net",
    icon: FileText,
    description: "Writing on data, AI, and infrastructure",
    span: "col-span-2",
  },
  {
    name: "Insights",
    href: "https://insights.duyet.net",
    icon: BarChart3,
    description: "Live telemetry and dashboards",
    span: "col-span-2",
  },
  {
    name: "LLM Timeline",
    href: "https://llm-timeline.duyet.net",
    icon: Clock,
    description: "Every LLM release, charted",
    span: "col-span-2",
  },
  {
    name: "Homelab",
    href: "https://homelab.duyet.net",
    icon: Server,
    description: "Cluster, services, devices",
    span: "col-span-2",
  },
  {
    name: "CV",
    href: "https://cv.duyet.net",
    icon: User,
    description: "Resume and career",
    span: "col-span-2 sm:col-span-1",
  },
  {
    name: "Photos",
    href: "https://photos.duyet.net",
    icon: Image,
    description: "Photography archive",
    span: "col-span-2 sm:col-span-1",
  },
  {
    name: "AI Percentage",
    href: "https://ai-percentage.duyet.net",
    icon: Bot,
    description: "AI-generated commit share",
    span: "col-span-2",
  },
];

export function SiteHeader({
  brand = "duyet",
  brandHref = "https://duyet.net",
  className,
}: SiteHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className,
      )}
    >
      <div className="mx-auto flex h-14 max-w-[1200px] items-center gap-6 px-4 sm:px-6 lg:px-8">
        <a
          href={brandHref}
          className="text-sm font-semibold tracking-tight transition-opacity hover:opacity-70"
        >
          {brand}
        </a>
        <div className="ml-auto flex items-center gap-1">
          <ThemeButton />
          <AppsDialog />
        </div>
      </div>
    </header>
  );
}

function AppsDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" aria-label="Open apps">
          <LayoutGrid className="h-4 w-4" />
          <span className="ml-1.5 text-sm">Apps</span>
          <kbd className="ml-2 hidden items-center gap-0.5 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground sm:inline-flex">
            ⌘K
          </kbd>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Apps</DialogTitle>
          <DialogDescription>duyet.net properties</DialogDescription>
        </DialogHeader>
        <div className="grid auto-rows-[7rem] grid-cols-4 gap-3">
          {APPS.map(({ name, href, icon: Icon, description, span }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex flex-col justify-between rounded-md border bg-card p-4 transition-colors hover:bg-muted",
                span,
              )}
            >
              <Icon className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="text-sm font-medium leading-tight">{name}</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-snug">
                  {description}
                </p>
              </div>
            </a>
          ))}
        </div>
      </DialogContent>
    </Dialog>
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

export default SiteHeader;
