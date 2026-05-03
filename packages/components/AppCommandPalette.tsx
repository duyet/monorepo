"use client";

import { cn } from "@duyet/libs/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Search } from "lucide-react";
import { useState } from "react";

const appItems = [
  {
    label: "Home",
    description: "duyet.net",
    href: "https://duyet.net",
  },
  {
    label: "Blog",
    description: "Technical writing and notes",
    href: "https://blog.duyet.net",
  },
  {
    label: "Projects",
    description: "Apps, tools, dashboards, and open source systems",
    href: "https://duyet.net/projects",
  },
  {
    label: "About",
    description: "Profile and work context",
    href: "https://duyet.net/about",
  },
  {
    label: "Experience",
    description: "CV and professional history",
    href: "https://cv.duyet.net",
  },
  {
    label: "Insights",
    description: "Analytics and operational dashboards",
    href: "https://insights.duyet.net",
  },
  {
    label: "Photos",
    description: "Photo gallery",
    href: "https://photos.duyet.net",
  },
  {
    label: "Homelab",
    description: "Homelab docs and services",
    href: "https://homelab.duyet.net",
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
          Search across Duyet apps and pages.
        </DialogDescription>
        <Command className="bg-transparent">
          <CommandInput placeholder="Search apps and pages..." />
          <CommandList className="max-h-[360px]">
            <CommandEmpty>No app found.</CommandEmpty>
            <CommandGroup heading="Duyet network">
              {appItems.map((item) => (
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
