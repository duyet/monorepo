"use client";

import { cn } from "@duyet/libs/utils";
import type { Profile } from "@duyet/profile";
import { duyetProfile } from "@duyet/profile";
import type { UrlsConfig } from "@duyet/urls";
import { duyetUrls } from "@duyet/urls";
import { Menu as MenuIcon, X as CloseIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import MenuNav, { type NavigationItem } from "../Menu";
import { AuthButtons } from "./AuthButtons";
import { HeaderBranding } from "./HeaderBranding";

interface HeaderProps {
  /** Profile configuration (defaults to duyetProfile) */
  profile?: Profile;
  /** URLs configuration (defaults to duyetUrls) */
  urls?: UrlsConfig;
  /** Show logo */
  logo?: boolean;
  /** Short text (overrides profile.personal.shortName) */
  shortText?: string;
  /** Long text (overrides profile.personal.title) */
  longText?: string;
  /** Center layout */
  center?: boolean;
  /** Navigation items (if not provided, Menu will use default) */
  navigationItems?: NavigationItem[];
  /** Optional action slot rendered with the navigation */
  actions?: ReactNode;
  /** Show auth controls */
  showAuthButtons?: boolean;
  /** When false, AuthButtons will not mount its own ClerkProvider */
  authButtonsWrapWithProvider?: boolean;
  /** Optional CSS classes */
  className?: string;
  /** Container CSS classes */
  containerClassName?: string;
}

/**
 * Header component with logo, branding, and navigation.
 *
 * Accepts profile and URL configuration to display personalized branding.
 * Falls back to Duyet's profile if none provided.
 *
 * @example
 * ```tsx
 * import { Header } from '@duyet/components'
 * import { duyetProfile } from '@duyet/profile'
 * import { duyetUrls } from '@duyet/urls'
 *
 * <Header profile={duyetProfile} urls={duyetUrls} />
 * ```
 */
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
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 767px)").matches;
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const syncViewport = () => {
      const mobile = mediaQuery.matches;
      setIsMobileViewport(mobile);
      if (!mobile) setMobileOpen(false);
    };
    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);
    return () => mediaQuery.removeEventListener("change", syncViewport);
  }, []);
  // Use profile defaults if not overridden
  const displayShortText = shortText ?? profile.personal.shortName;
  const displayLongText = longText ?? profile.personal.title;

  return (
    <header
      className={cn(
        "z-50 bg-white/95 backdrop-blur dark:bg-[#0d0e0c]/95",
        className
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-[1280px] flex-row items-center justify-between gap-3 px-5 py-4 sm:px-8 lg:px-10",
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

        {!isMobileViewport ? (
          <nav className="flex items-center gap-7 text-sm font-medium">
            <MenuNav
              urls={urls}
              navigationItems={navigationItems}
              className="gap-7"
            />
            {actions}
            {showAuthButtons ? (
              <AuthButtons
                urls={urls}
                wrapWithProvider={authButtonsWrapWithProvider}
              />
            ) : null}
          </nav>
        ) : (
          <div className="relative flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#1a1a1a]/15 bg-white text-[#1a1a1a]"
            >
              {mobileOpen ? (
                <CloseIcon className="h-5 w-5" />
              ) : (
                <MenuIcon className="h-5 w-5" />
              )}
            </button>
            <div className="flex shrink-0 items-center gap-2">
              {actions}
              {showAuthButtons ? (
                <AuthButtons
                  urls={urls}
                  wrapWithProvider={authButtonsWrapWithProvider}
                />
              ) : null}
            </div>
            {mobileOpen ? (
              <div className="absolute right-0 top-12 z-50 min-w-48 rounded-lg border border-[#1a1a1a]/12 bg-white p-3 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                <MenuNav
                  urls={urls}
                  navigationItems={navigationItems}
                  onItemClick={() => setMobileOpen(false)}
                  className="flex-col items-start gap-3 whitespace-nowrap"
                />
              </div>
            ) : null}
          </div>
        )}
      </div>
    </header>
  );
}
