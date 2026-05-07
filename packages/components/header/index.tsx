"use client";

import { cn } from "@duyet/libs/utils";
import type { Profile } from "@duyet/profile";
import { duyetProfile } from "@duyet/profile";
import type { UrlsConfig } from "@duyet/urls";
import { duyetUrls } from "@duyet/urls";
import { Menu as MenuIcon, X as CloseIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import MenuNav, { type NavigationItem } from "../Menu";
import { AuthButtons } from "./AuthButtons";
import { HeaderBranding } from "./HeaderBranding";

interface HeaderProps {
  profile?: Profile;
  urls?: UrlsConfig;
  logo?: boolean;
  shortText?: string;
  longText?: string;
  center?: boolean;
  navigationItems?: NavigationItem[];
  actions?: ReactNode;
  showAuthButtons?: boolean;
  authButtonsWrapWithProvider?: boolean;
  className?: string;
  containerClassName?: string;
}

export default function Header({
  profile = duyetProfile,
  urls = duyetUrls,
  logo = true,
  shortText,
  longText,
  center = false,
  navigationItems,
  actions,
  showAuthButtons = true,
  authButtonsWrapWithProvider = true,
  className,
  containerClassName,
}: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const displayShortText = shortText ?? profile.personal.shortName;
  const displayLongText = longText ?? profile.personal.title;

  return (
    <header
      className={cn(
        "z-50 bg-[var(--background)]",
        "border-b border-[var(--border)] dark:border-white/8",
        className
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-[1200px] items-center justify-between px-5 py-3 sm:px-8 lg:px-10",
          containerClassName
        )}
      >
        <HeaderBranding
          homeUrl={urls.apps.home}
          shortText={displayShortText}
          longText={displayLongText}
          logo={logo}
          center={center}
        />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <MenuNav
            urls={urls}
            navigationItems={navigationItems}
            className="gap-1"
          />
          {actions}
          {showAuthButtons && (
            <AuthButtons
              urls={urls}
              wrapWithProvider={authButtonsWrapWithProvider}
            />
          )}
        </nav>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-2">
          {actions}
          {showAuthButtons && (
            <AuthButtons
              urls={urls}
              wrapWithProvider={authButtonsWrapWithProvider}
            />
          )}
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-lg",
              "text-[var(--muted-foreground)] dark:text-[#f8f8f2]/70",
              "hover:bg-[var(--muted)] dark:hover:bg-white/5",
              "transition-colors"
            )}
          >
            {mobileOpen ? (
              <CloseIcon className="h-4 w-4" />
            ) : (
              <MenuIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav panel */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-200 ease-out",
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="border-t border-[var(--border)] dark:border-white/8 px-5 py-3">
          <MenuNav
            urls={urls}
            navigationItems={navigationItems}
            onItemClick={() => setMobileOpen(false)}
            className="flex-col items-start gap-1"
          />
        </div>
      </div>
    </header>
  );
}
