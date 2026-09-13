"use client";

import { cn } from "@duyet/libs/utils";
import { Separator } from "../ui/separator";
import { twHeader } from "./tw";
import { AppSwitcher } from "./AppSwitcher";
import { GlobalNav } from "./GlobalNav";
import { LocalNav } from "./LocalNav";
import { MobileNav } from "./MobileNav";
import { ThemeButton } from "./ThemeButton";
import type { SiteHeaderProps } from "./types";

export type { SiteHeaderProps } from "./types";

export function SiteHeader({
  currentApp = "home",
  localNav,
  activeHref,
  className,
  hideThemeToggle = false,
  variant = "default",
  cta,
}: SiteHeaderProps) {
  if (variant === "slashy") {
    return (
      <header
        className={cn(
          "sticky top-0 z-[999] w-full min-h-16 bg-[var(--rd-bg)]",
          className
        )}
      >
        <div className="relative mx-auto flex h-16 max-w-[var(--rd-maxw,1120px)] items-center gap-4 px-[var(--rd-pad,1.25rem)]">
          <div className="shrink-0">
            <AppSwitcher currentApp={currentApp} variant="wordmark" />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1 max-lg:hidden lg:absolute lg:left-1/2 lg:-translate-x-1/2">
            {localNav && localNav.length > 0 ? (
              <LocalNav
                items={localNav}
                activeHref={activeHref}
                variant="slashy"
              />
            ) : null}
            <GlobalNav
              currentApp={currentApp}
              localNav={localNav}
              variant="slashy"
            />
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <MobileNav currentApp={currentApp} localNav={localNav} />
            {!hideThemeToggle ? <ThemeButton /> : null}
            {cta ? (
              <a href={cta.href} className={twHeader.cta}>
                {cta.label}
              </a>
            ) : null}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-[999] w-full border-b border-[var(--rd-border)] bg-[var(--rd-bg)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--rd-bg)]/60",
        className
      )}
    >
      <div className="mx-auto flex h-14 max-w-[1080px] items-center px-4 sm:px-6 lg:px-8">
        <AppSwitcher currentApp={currentApp} />
        {localNav && localNav.length > 0 && (
          <LocalNav items={localNav} activeHref={activeHref} />
        )}
        <div className="ml-auto flex shrink-0 items-center gap-1">
          <MobileNav currentApp={currentApp} localNav={localNav} />
          <GlobalNav currentApp={currentApp} localNav={localNav} />
          {!hideThemeToggle && (
            <>
              <Separator
                orientation="vertical"
                className="mx-1 hidden h-6 md:block"
              />
              <ThemeButton />
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;
