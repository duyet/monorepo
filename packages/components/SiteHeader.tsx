"use client";

import { cn } from "@duyet/libs/utils";
import { Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export interface SiteHeaderLink {
  label: string;
  href: string;
}

export interface SiteHeaderProps {
  brand?: string;
  brandHref?: string;
  links?: SiteHeaderLink[];
  activeHref?: string;
  className?: string;
}

const DEFAULT_LINKS: SiteHeaderLink[] = [
  { label: "Home", href: "https://duyet.net" },
  { label: "Blog", href: "https://blog.duyet.net" },
  { label: "Insights", href: "https://insights.duyet.net" },
  { label: "Timeline", href: "https://llm-timeline.duyet.net" },
  { label: "Homelab", href: "https://homelab.duyet.net" },
];

export function SiteHeader({
  brand = "duyet",
  brandHref = "https://duyet.net",
  links = DEFAULT_LINKS,
  activeHref,
  className,
}: SiteHeaderProps) {
  return (
    <header className={cn("sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
      <div className="mx-auto flex h-14 max-w-[1200px] items-center gap-6 px-4 sm:px-6 lg:px-8">
        <a
          href={brandHref}
          className="text-sm font-semibold tracking-tight transition-opacity hover:opacity-70"
        >
          {brand}
        </a>
        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {links.map((link) => {
            const active = activeHref === link.href;
            return (
              <Button
                key={link.href}
                asChild
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 px-3 text-sm font-medium text-muted-foreground hover:text-foreground",
                  active && "text-foreground"
                )}
              >
                <a href={link.href}>{link.label}</a>
              </Button>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <ThemeButton />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {links.map((link) => (
                <DropdownMenuItem key={link.href} asChild>
                  <a href={link.href}>{link.label}</a>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
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
