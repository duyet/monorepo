"use client";

import { cn } from "@duyet/libs";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  ChevronDown,
  Code,
  Globe,
  Home,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  text: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  description?: string;
}

const navItems: NavItem[] = [
  {
    text: "Overview",
    href: "/",
    icon: Home,
    description: "Dashboard overview with key metrics",
  },
  {
    text: "Blog",
    href: "/blog",
    icon: Globe,
    description: "Traffic analytics from Cloudflare & PostHog",
  },
  {
    text: "Github",
    href: "/github",
    icon: Code,
    description: "GitHub activity and repository insights",
  },
  {
    text: "Wakatime",
    href: "/wakatime",
    icon: Activity,
    description: "Coding time and productivity tracking",
  },
  {
    text: "AI",
    href: "/ai",
    icon: BarChart3,
    description: "Claude Code usage and cost analytics",
  },
];

interface CompactNavigationProps {
  className?: string;
}

export function CompactNavigation({ className }: CompactNavigationProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [isOpen, setIsOpen] = useState(false);

  // Extract the base path (first segment) for matching
  const getBasePath = (path: string) => {
    const segments = path.split("/").filter(Boolean);
    return segments[0] ? `/${segments[0]}` : "/";
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className={cn("hidden md:block", className)}>
        <div className="flex flex-wrap items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const currentBasePath = getBasePath(pathname);
            const isActive =
              pathname === item.href || currentBasePath === item.href;

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center space-x-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors",
                  "border-[#1a1a1a]/12 bg-white hover:border-[#1a1a1a]/30 hover:bg-[#f5f5ef] dark:border-white/12 dark:bg-[#171815] dark:hover:border-white/30 dark:hover:bg-[#20211d]",
                  isActive
                    ? "border-[#1a1a1a] bg-[#1a1a1a] text-white dark:border-[#f8f8f2] dark:bg-[#f8f8f2] dark:text-[#11120f]"
                    : "text-[#1a1a1a]/70 dark:text-[#f8f8f2]/70"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.text}</span>
                {item.badge && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Mobile Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 rounded-lg border border-[#1a1a1a]/12 bg-white px-3 py-2 text-sm font-medium text-[#1a1a1a] dark:border-white/12 dark:bg-[#171815] dark:text-[#f8f8f2]"
        >
          <Menu className="h-4 w-4" />
          <span>Menu</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </button>

        {/* Mobile Menu Overlay */}
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <div className="fixed bottom-3 left-1/2 z-50 max-h-[85vh] w-[min(360px,calc(100vw-1rem))] -translate-x-1/2 overflow-y-auto rounded-xl border border-[#1a1a1a]/12 bg-white p-4 shadow-lg dark:border-white/12 dark:bg-[#171815]">
              <div className="sticky top-0 mb-4 flex items-center justify-between bg-card pb-2">
                <h3 className="text-sm font-semibold">Navigation</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1 hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const currentBasePath = getBasePath(pathname);
                  const isActive =
                    pathname === item.href || currentBasePath === item.href;

                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-start space-x-3 rounded-lg border p-3 transition-colors",
                        "border-[#1a1a1a]/10 hover:border-[#1a1a1a]/25 hover:bg-[#f5f5ef] dark:border-white/10 dark:hover:border-white/25 dark:hover:bg-[#20211d]",
                        isActive
                          ? "border-[#1a1a1a] bg-[#1a1a1a] text-white dark:border-[#f8f8f2] dark:bg-[#f8f8f2] dark:text-[#11120f]"
                          : "text-[#1a1a1a]/70 dark:text-[#f8f8f2]/70"
                      )}
                    >
                      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{item.text}</span>
                          {item.badge && (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

interface BreadcrumbProps {
  items: Array<{ label: string; href?: string }>;
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav className={cn("flex text-sm text-muted-foreground", className)}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <span className="mx-2">/</span>}
          {item.href ? (
            <Link
              to={item.href}
              className="transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-foreground">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
