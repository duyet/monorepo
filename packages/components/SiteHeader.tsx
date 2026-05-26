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
  X,
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
  { name: "Home", href: "https://duyet.net", icon: Home, description: "Personal homepage and project directory", span: "col-span-2 row-span-2" },
  { name: "Blog", href: "https://blog.duyet.net", icon: FileText, description: "Writing on data, AI, and infrastructure", span: "col-span-2" },
  { name: "Insights", href: "https://insights.duyet.net", icon: BarChart3, description: "Live telemetry and dashboards", span: "col-span-2" },
  { name: "LLM Timeline", href: "https://llm-timeline.duyet.net", icon: Clock, description: "Every LLM release, charted", span: "col-span-2" },
  { name: "Homelab", href: "https://homelab.duyet.net", icon: Server, description: "Cluster, services, devices", span: "col-span-2" },
  { name: "CV", href: "https://cv.duyet.net", icon: User, description: "Resume and career", span: "col-span-2 sm:col-span-1" },
  { name: "Photos", href: "https://photos.duyet.net", icon: Image, description: "Photography archive", span: "col-span-2 sm:col-span-1" },
  { name: "AI Percentage", href: "https://ai-percentage.duyet.net", icon: Bot, description: "AI-generated commit share", span: "col-span-2" },
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
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        aria-label="Open apps"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto p-0 gap-0 [&>button[type=button]:last-of-type]:hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-background z-10">
            <span className="text-sm font-semibold tracking-tight">duyet.net</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label="Close"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogHeader className="sr-only">
            <DialogTitle>Apps</DialogTitle>
            <DialogDescription>duyet.net properties</DialogDescription>
          </DialogHeader>
          <nav className="px-6 py-8 flex flex-col">
            {APPS.map(({ name, href, description }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group block py-5 border-b last:border-b-0 transition-colors hover:bg-muted -mx-6 px-6"
              >
                <h3 className="text-lg md:text-xl font-semibold tracking-tight group-hover:text-foreground">
                  {name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {description}
                </p>
              </a>
            ))}
          </nav>
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
