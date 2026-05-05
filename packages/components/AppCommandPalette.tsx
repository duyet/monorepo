"use client";

import { cn } from "@duyet/libs/utils";
import { duyetUrls } from "@duyet/urls";
import {
  Archive,
  BookOpen,
  Bot,
  Briefcase,
  Code2,
  FileSearch,
  FolderKanban,
  Globe,
  Home,
  Images,
  LayoutDashboard,
  Link2,
  Radio,
  type LucideIcon,
} from "lucide-react";
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
  icon: LucideIcon;
};

const appItems: PaletteItem[] = [
  {
    label: "Home",
    description: "Main landing page",
    href: duyetUrls.apps.home,
    icon: Home,
  },
  {
    label: "Blog",
    description: "Technical writing and notes",
    href: duyetUrls.apps.blog,
    icon: BookOpen,
  },
  {
    label: "Archives",
    description: "Chronological archive of posts",
    href: `${duyetUrls.apps.blog}/archives/`,
    icon: Archive,
  },
  {
    label: "Featured",
    description: "Highlighted posts",
    href: `${duyetUrls.apps.blog}/featured/`,
    icon: Radio,
  },
  {
    label: "Series",
    description: "Long-form post collections",
    href: `${duyetUrls.apps.blog}/series/`,
    icon: FolderKanban,
  },
  {
    label: "Tags",
    description: "Browse by topic",
    href: `${duyetUrls.apps.blog}/tags/`,
    icon: Code2,
  },
  {
    label: "Search",
    description: "Search blog posts and content",
    href: `${duyetUrls.apps.blog}/search`,
    icon: FileSearch,
  },
  {
    label: "Projects",
    description: "Apps, tools, dashboards, and open source systems",
    href: `${duyetUrls.apps.home}/projects`,
    icon: LayoutDashboard,
  },
  {
    label: "Short URLs",
    description: "Search and browse redirect links",
    href: `${duyetUrls.apps.home}/ls`,
    icon: Link2,
  },
  {
    label: "About",
    description: "Profile and work context",
    href: `${duyetUrls.apps.home}/about`,
    icon: Briefcase,
  },
  {
    label: "Experience",
    description: "CV and professional history",
    href: duyetUrls.apps.cv,
    icon: Briefcase,
  },
  {
    label: "Insights",
    description: "Analytics and operational dashboards",
    href: duyetUrls.apps.insights,
    icon: LayoutDashboard,
  },
  {
    label: "Photos",
    description: "Photo gallery",
    href: duyetUrls.apps.photos,
    icon: Images,
  },
  {
    label: "Homelab",
    description: "Homelab docs and services",
    href: duyetUrls.apps.homelab,
    icon: FolderKanban,
  },
  {
    label: "LLM Timeline",
    description: "Language model release timeline",
    href: "https://llm-timeline.duyet.net",
    icon: Radio,
  },
  {
    label: "Agents",
    description: "AI chat workspace",
    href: "https://agents.duyet.net",
    icon: Bot,
  },
  {
    label: "API",
    description: "Public API",
    href: "https://api.duyet.net",
    icon: Globe,
  },
  {
    label: "Status",
    description: "System status",
    href: "https://status.duyet.net",
    icon: Radio,
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
            "flex items-center justify-center rounded-lg p-2 text-[#1a1a1a] transition-colors hover:bg-[#1a1a1a]/5",
            className
          )}
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="w-[min(620px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#1a1a1a]/10 bg-white p-0 text-[#1a1a1a] shadow-none dark:border-[#1a1a1a]/10 dark:bg-white dark:text-[#1a1a1a] dark:shadow-none">
        <DialogTitle className="sr-only">Command Palette</DialogTitle>
        <DialogDescription className="sr-only">
          Search across Duyet apps, pages, and subdomains.
        </DialogDescription>
        <Command className="bg-transparent">
          <CommandInput
            placeholder="Search pages and apps..."
            className="text-lg font-medium placeholder:text-[#1a1a1a]/50 dark:placeholder:text-[#1a1a1a]/50"
          />
          <CommandList className="max-h-[460px] p-2">
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
                  className="items-start rounded-xl border border-transparent px-3 py-3 data-[selected=true]:border-[#1a1a1a]/10 data-[selected=true]:bg-[#f7f7f7] data-[selected=true]:text-[#1a1a1a] dark:data-[selected=true]:border-[#1a1a1a]/10 dark:data-[selected=true]:bg-[#f7f7f7] dark:data-[selected=true]:text-[#1a1a1a]"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#1a1a1a]/10 bg-white">
                      <item.icon className="h-4 w-4 text-[#1a1a1a]/80" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold tracking-tight">{item.label}</div>
                      <div className="truncate text-xs text-[#1a1a1a]/55 dark:text-[#1a1a1a]/55">
                        {item.description}
                      </div>
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
                  className="items-start rounded-xl border border-transparent px-3 py-3 data-[selected=true]:border-[#1a1a1a]/10 data-[selected=true]:bg-[#f7f7f7] data-[selected=true]:text-[#1a1a1a] dark:data-[selected=true]:border-[#1a1a1a]/10 dark:data-[selected=true]:bg-[#f7f7f7] dark:data-[selected=true]:text-[#1a1a1a]"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#1a1a1a]/10 bg-white">
                      <item.icon className="h-4 w-4 text-[#1a1a1a]/80" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold tracking-tight">{item.label}</div>
                      <div className="truncate text-xs text-[#1a1a1a]/55 dark:text-[#1a1a1a]/55">
                        {item.description}
                      </div>
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
