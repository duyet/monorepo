"use client";

import { cn } from "@duyet/libs/utils";
import { List, SquaresFour } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { AppCommandPalette } from "../AppCommandPalette";
import ThemeToggle from "../ThemeToggle";
import { AppsDrawer } from "./AppsDrawer";

export interface SiteNavV2Props {
  brandText?: string;
  brandHref?: string;
  links?: { name: string; href: string; active?: boolean }[];
  activeApp?:
    | "home"
    | "blog"
    | "cv"
    | "insights"
    | "photos"
    | "homelab"
    | "agent";
  className?: string;
  alwaysScrolled?: boolean;
}

export function SiteNavV2({
  brandText = "duyet.net",
  brandHref = "https://duyet.net",
  links = [],
  activeApp,
  className,
  alwaysScrolled = false,
}: SiteNavV2Props) {
  const [scrolled, setScrolled] = useState(alwaysScrolled);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    if (alwaysScrolled) {
      setScrolled(true);
      return;
    }
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      setScrolled(window.scrollY > 4);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [alwaysScrolled]);

  return (
    <>
      <header
        className={cn(
          "relative z-40 h-12 w-full border-b transition-all duration-200",
          scrolled
            ? "border-neutral-200/50 bg-white/70 backdrop-blur-md dark:border-white/5 dark:bg-[#0a0a0a]/70"
            : "border-transparent bg-transparent",
          className
        )}
      >
        <div className="mx-auto flex h-full max-w-[1040px] items-center justify-between px-5 sm:px-8">
          {/* Brand & Left Links */}
          <div className="flex items-center gap-8 h-full">
            <a
              href={brandHref}
              className="flex items-center gap-1.5 text-sm font-bold tracking-tight text-neutral-900 dark:text-white animate-fade-in"
            >
              <span>{brandText}</span>
              <span
                className="h-[6px] w-[6px] rounded-full bg-[var(--cf-orange)]"
                aria-hidden="true"
              />
            </a>

            {/* Desktop Links (Left Adjacent) */}
            {links.length > 0 && (
              <nav
                aria-label="Primary"
                className="hidden items-center gap-6 md:flex h-full"
              >
                {links.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    aria-current={link.active ? "page" : undefined}
                    className={cn(
                      "relative flex h-full items-center text-xs font-semibold tracking-tight transition-colors py-1.5 cursor-pointer",
                      "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white",
                      "after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-[var(--cf-orange)] after:transition-all after:duration-200",
                      link.active
                        ? "text-neutral-900 dark:text-white after:scale-x-100 after:opacity-100"
                        : "after:scale-x-0 after:opacity-0"
                    )}
                  >
                    {link.name}
                  </a>
                ))}
              </nav>
            )}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Command Palette Button (⌘K) */}
            <CommandPaletteButton onClick={() => setPaletteOpen(true)} />

            {/* Desktop Apps Drawer Button */}
            <AppsButton onClick={() => setDrawerOpen(true)} />

            {/* Theme Toggle */}
            <div className="hidden sm:block scale-90 origin-right">
              <ThemeToggle />
            </div>

            {/* Mobile Hamburger Drawer Trigger */}
            <MobileMenuButton onClick={() => setDrawerOpen(true)} />
          </div>
        </div>
      </header>

      {/* Slide-in Right Drawer */}
      <AppsDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeApp={activeApp}
      />

      {/* Command Palette Dialog */}
      <AppCommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        hideDefaultTrigger={true}
      />
    </>
  );
}

// Sub-components

function AppsButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200/50 bg-neutral-50/50 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-900 dark:border-white/5 dark:bg-white/[0.02] dark:text-neutral-400 dark:hover:border-white/10 dark:hover:bg-white/[0.04] dark:hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cf-orange)]"
      aria-label="Open applications drawer"
    >
      <SquaresFour size={16} weight="bold" />
    </button>
  );
}

function CommandPaletteButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[var(--cf-orange)]/25 bg-[var(--cf-orange)]/[0.06] px-3 text-xs font-semibold text-[var(--cf-orange)] hover:bg-[var(--cf-orange)]/[0.12] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cf-orange)]"
      aria-label="Open command palette"
    >
      <span className="opacity-90">Search</span>
      <kbd className="hidden sm:inline-block font-mono text-[9px] bg-[var(--cf-orange)]/15 px-1 py-0.5 rounded opacity-90">
        ⌘K
      </kbd>
    </button>
  );
}

function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex md:hidden h-8 w-8 items-center justify-center rounded-lg border border-neutral-200/50 bg-neutral-50/50 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-900 dark:border-white/5 dark:bg-white/[0.02] dark:text-neutral-400 dark:hover:border-white/10 dark:hover:bg-white/[0.04] dark:hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cf-orange)]"
      aria-label="Open navigation menu"
    >
      <List size={16} weight="bold" />
    </button>
  );
}
