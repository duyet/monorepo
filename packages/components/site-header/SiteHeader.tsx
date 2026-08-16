"use client";

import { cn } from "@duyet/libs/utils";
import { Separator } from "../ui/separator";
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
}: SiteHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-[999] w-full border-b border-[var(--rd-border)] bg-[var(--rd-bg)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--rd-bg)]/60",
        className,
      )}
    >
      <div className="mx-auto flex h-14 max-w-[1080px] items-center px-4 sm:px-6 lg:px-8">
        <AppSwitcher currentApp={currentApp} />
        {localNav && localNav.length > 0 && (
          <LocalNav items={localNav} activeHref={activeHref} />
        )}
        <div className="ml-auto flex items-center gap-1">
          <MobileNav currentApp={currentApp} />
          <GlobalNav currentApp={currentApp} />
          <Separator
            orientation="vertical"
            className="mx-1 hidden h-6 md:block"
          />
          <ThemeButton />
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;
