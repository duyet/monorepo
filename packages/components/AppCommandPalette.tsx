"use client";

import { cn } from "@duyet/libs/utils";
import { duyetUrls } from "@duyet/urls";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./ui/command";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

type PaletteItem = {
  label: string;
  description: string;
  href: string;
};

const appItems: PaletteItem[] = [
  {
    label: "Home",
    description: "Main landing page",
    href: duyetUrls.apps.home,
  },
  {
    label: "Blog",
    description: "Technical writing and notes",
    href: duyetUrls.apps.blog,
  },
  {
    label: "Archives",
    description: "Chronological archive of posts",
    href: `${duyetUrls.apps.blog}/archives/`,
  },
  {
    label: "Featured",
    description: "Highlighted posts",
    href: `${duyetUrls.apps.blog}/featured/`,
  },
  {
    label: "Series",
    description: "Long-form post collections",
    href: `${duyetUrls.apps.blog}/series/`,
  },
  {
    label: "Tags",
    description: "Browse by topic",
    href: `${duyetUrls.apps.blog}/tags/`,
  },
  {
    label: "Search",
    description: "Search blog posts and content",
    href: `${duyetUrls.apps.blog}/search`,
  },
  {
    label: "Projects",
    description: "Apps, tools, dashboards, and open source systems",
    href: `${duyetUrls.apps.home}/projects`,
  },
  {
    label: "Short URLs",
    description: "Search and browse redirect links",
    href: `${duyetUrls.apps.home}/ls`,
  },
  {
    label: "About",
    description: "Profile and work context",
    href: `${duyetUrls.apps.home}/about`,
  },
  {
    label: "Experience",
    description: "CV and professional history",
    href: duyetUrls.apps.cv,
  },
  {
    label: "Insights",
    description: "Analytics and operational dashboards",
    href: duyetUrls.apps.insights,
  },
  {
    label: "Photos",
    description: "Photo gallery",
    href: duyetUrls.apps.photos,
  },
  {
    label: "Homelab",
    description: "Homelab docs and services",
    href: duyetUrls.apps.homelab,
  },
  {
    label: "LLM Timeline",
    description: "Language model release timeline",
    href: "https://llm-timeline.duyet.net",
  },
  {
    label: "Agents",
    description: "AI chat workspace",
    href: "https://agents.duyet.net",
  },
  {
    label: "API",
    description: "Public API",
    href: "https://api.duyet.net",
  },
  {
    label: "Status",
    description: "System status",
    href: "https://status.duyet.net",
  },
];

interface AppCommandPaletteProps {
  className?: string;
}

export function AppCommandPalette({ className }: AppCommandPaletteProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "k") {
        return;
      }

      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        event.target instanceof HTMLElement &&
          event.target.isContentEditable
      ) {
        return;
      }

      event.preventDefault();
      setOpen(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-[#1a1a1a]/5 dark:hover:bg-white/5",
            className
          )}
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="w-[min(520px,calc(100vw-2rem))] overflow-hidden rounded-xl border-[#1a1a1a]/10 bg-white p-0 text-[#1a1a1a] dark:border-white/10 dark:bg-[#1a1a1a] dark:text-[#f8f8f2]">
        <DialogTitle className="sr-only">Command Palette</DialogTitle>
        <DialogDescription className="sr-only">
          Search across Duyet apps, pages, and subdomains.
        </DialogDescription>
        <Command className="bg-transparent">
          <CommandInput placeholder="Search pages and apps..." />
          <CommandList className="max-h-[360px]">
            <CommandEmpty>No app found.</CommandEmpty>
            <CommandGroup heading="Duyet apps">
              {appItems.slice(0, 11).map((item) => (
                <CommandItem
                  key={item.href}
                  value={`${item.label} ${item.description}`}
                  onSelect={() => {
                    setOpen(false);
                    window.location.href = item.href;
                  }}
                  className="items-start rounded-lg px-3 py-3"
                >
                  <div className="min-w-0">
                    <div className="font-medium">{item.label}</div>
                    <div className="truncate text-xs text-[#1a1a1a]/55 dark:text-[#f8f8f2]/55">
                      {item.description}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="External">
              {appItems.slice(11).map((item) => (
                <CommandItem
                  key={item.href}
                  value={`${item.label} ${item.description}`}
                  onSelect={() => {
                    setOpen(false);
                    window.location.href = item.href;
                  }}
                  className="items-start rounded-lg px-3 py-3"
                >
                  <div className="min-w-0">
                    <div className="font-medium">{item.label}</div>
                    <div className="truncate text-xs text-[#1a1a1a]/55 dark:text-[#f8f8f2]/55">
                      {item.description}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
