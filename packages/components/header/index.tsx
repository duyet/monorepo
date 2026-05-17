"use client";

import { cn } from "@duyet/libs/utils";
import type { Profile } from "@duyet/profile";
import { duyetProfile } from "@duyet/profile";
import type { UrlsConfig } from "@duyet/urls";
import { duyetUrls } from "@duyet/urls";
import { Menu as MenuIcon, X as CloseIcon } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
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
  authSimpleAvatar?: boolean;
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
  authSimpleAvatar = false,
  className,
  containerClassName,
}: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(64);
  const displayShortText = shortText ?? profile.personal.shortName;
  const displayLongText = longText ?? profile.personal.title;

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const updateHeaderHeight = () => {
      setHeaderHeight(header.getBoundingClientRect().height);
    };

    updateHeaderHeight();
    const observer = new ResizeObserver(updateHeaderHeight);
    observer.observe(header);

    return () => observer.disconnect();
  }, []);

  return (
    <header
      ref={headerRef}
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
              simpleAvatar={authSimpleAvatar}
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
              simpleAvatar={authSimpleAvatar}
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
          "md:hidden fixed inset-x-0 top-[var(--mobile-menu-offset)] z-40 min-h-[calc(100dvh-var(--mobile-menu-offset))] bg-[var(--background)] px-5 py-8 transition-all duration-200 ease-out sm:px-8",
          mobileOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0"
        )}
        style={
          {
            "--mobile-menu-offset": `${headerHeight}px`,
          } as CSSProperties
        }
        aria-hidden={!mobileOpen}
      >
        <div className="border-y border-[var(--hairline)] py-4 dark:border-white/8">
          <MenuNav
            urls={urls}
            navigationItems={navigationItems}
            onItemClick={() => setMobileOpen(false)}
            className="flex-col items-stretch gap-0"
          />
        </div>
      </div>
    </header>
  );
}
