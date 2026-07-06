"use client";

import { cn } from "@duyet/libs/utils";
import { duyetUrls } from "@duyet/urls";
import {
  Camera,
  ChartBar,
  ChatCircle,
  Code,
  House,
  Newspaper,
  Robot,
  X,
} from "@phosphor-icons/react";
import { useEffect } from "react";

export interface AppsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeApp?:
    | "home"
    | "blog"
    | "cv"
    | "insights"
    | "photos"
    | "homelab"
    | "agent";
}

export function AppsDrawer({ isOpen, onClose, activeApp }: AppsDrawerProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const apps = [
    {
      name: "Home",
      key: "home" as const,
      href: duyetUrls.apps.home,
      icon: House,
      desc: "Personal portfolio and directory",
    },
    {
      name: "Blog",
      key: "blog" as const,
      href: duyetUrls.apps.blog,
      icon: Newspaper,
      desc: "Technical writing & notes",
    },
    {
      name: "Insights",
      key: "insights" as const,
      href: duyetUrls.apps.insights,
      icon: ChartBar,
      desc: "Analytics & operational dashboards",
    },
    {
      name: "Agent",
      key: "agent" as const,
      href: "https://agents.duyet.net",
      icon: Robot,
      desc: "Personal AI assistant (duyetbot)",
    },
    {
      name: "CV",
      key: "cv" as const,
      href: duyetUrls.apps.cv,
      icon: ChatCircle,
      desc: "Resume & professional experience",
    },
    {
      name: "Photos",
      key: "photos" as const,
      href: duyetUrls.apps.photos,
      icon: Camera,
      desc: "Visual photography showcase",
    },
    {
      name: "Homelab",
      key: "homelab" as const,
      href: duyetUrls.apps.homelab,
      icon: Code,
      desc: "Personal infrastructure documentation",
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300",
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex h-full w-full flex-col border-l border-neutral-200/50 bg-white p-6 shadow-2xl transition-transform duration-300 ease-in-out dark:border-white/10 dark:bg-[#121212] sm:max-w-6xl sm:w-[384px]",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-neutral-200/50 pb-4 dark:border-white/10">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
              Navigation
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Jump to sibling applications
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6" aria-label="Sibling apps">
          <div className="grid gap-3">
            {apps.map((app) => {
              const Icon = app.icon;
              const isActive = activeApp === app.key;

              return (
                <a
                  key={app.key}
                  href={app.href}
                  className={cn(
                    "group flex items-start gap-4 rounded-xl border p-4 transition-all duration-200",
                    isActive
                      ? "border-[var(--cf-orange)]/30 bg-[var(--cf-orange)]/[0.03] text-neutral-900 dark:text-white"
                      : "border-neutral-200/50 bg-neutral-50/30 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 dark:border-white/5 dark:bg-white/[0.02] dark:text-neutral-300 dark:hover:border-white/10 dark:hover:bg-white/[0.04]"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors",
                      isActive
                        ? "border-[var(--cf-orange)]/20 bg-white text-[var(--cf-orange)] dark:bg-neutral-900"
                        : "border-neutral-200 bg-white text-neutral-600 group-hover:text-neutral-900 dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-400 dark:group-hover:text-white"
                    )}
                  >
                    <Icon size={20} weight={isActive ? "fill" : "regular"} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold tracking-tight">
                        {app.name}
                      </span>
                      {isActive && (
                        <span className="inline-flex items-center rounded bg-[var(--cf-orange)]/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--cf-orange)]">
                          current
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                      {app.desc}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-neutral-200/50 pt-4 dark:border-white/10 text-center">
          <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
            Powered by @duyet/urls · Redesign v2
          </p>
        </div>
      </div>
    </>
  );
}
