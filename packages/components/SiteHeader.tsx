"use client";

import { cn } from "@duyet/libs/utils";
import {
  BarChart3,
  Bot,
  Clock,
  FileText,
  Home,
  Image,
  Moon,
  Search,
  Server,
  Sun,
  User,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Dialog, DialogContent } from "./ui/dialog";

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
};

const APPS: App[] = [
  { name: "Home", href: "https://duyet.net", icon: Home, description: "Personal homepage and project directory" },
  { name: "Blog", href: "https://blog.duyet.net", icon: FileText, description: "Writing on data, AI, and infrastructure" },
  { name: "Insights", href: "https://insights.duyet.net", icon: BarChart3, description: "Live telemetry and dashboards" },
  { name: "LLM Timeline", href: "https://llm-timeline.duyet.net", icon: Clock, description: "Every LLM release, charted" },
  { name: "Homelab", href: "https://homelab.duyet.net", icon: Server, description: "Cluster, services, devices" },
  { name: "CV", href: "https://cv.duyet.net", icon: User, description: "Resume and career" },
  { name: "Photos", href: "https://photos.duyet.net", icon: Image, description: "Photography archive" },
  { name: "AI Percentage", href: "https://ai-percentage.duyet.net", icon: Bot, description: "AI-generated commit share" },
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
    <>
      <Button
        variant="outline"
        size="sm"
        aria-label="Open apps menu"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline text-sm text-muted-foreground">Search…</span>
        <kbd className="ml-2 hidden items-center gap-0.5 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground sm:inline-flex">
          ⌘K
        </kbd>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 sm:max-w-lg">
          <Command>
            <CommandInput placeholder="Search apps…" />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Apps">
                {APPS.map(({ name, href, icon: Icon, description }) => (
                  <CommandItem
                    key={href}
                    value={`${name} ${description}`}
                    onSelect={() => {
                      window.location.href = href;
                    }}
                    className="gap-3"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{name}</span>
                      <span className="text-xs text-muted-foreground">
                        {description}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
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

export default SiteHeader;
