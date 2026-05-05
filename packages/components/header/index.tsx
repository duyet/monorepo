"use client";

import { cn } from "@duyet/libs/utils";
import type { Profile } from "@duyet/profile";
import { duyetProfile } from "@duyet/profile";
import type { UrlsConfig } from "@duyet/urls";
import { duyetUrls } from "@duyet/urls";
import type { ReactNode } from "react";
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
  // Use profile defaults if not overridden
  const displayShortText = shortText ?? profile.personal.shortName;
  const displayLongText = longText ?? profile.personal.title;

  return (
    <header
      className={cn(
        "z-50 border-b border-[#1a1a1a]/10 bg-white/95 backdrop-blur dark:border-white/10 dark:bg-[#0d0e0c]/95",
        className
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-[1280px] flex-col gap-3 px-5 py-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:gap-0 lg:px-10",
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
        <nav className="hidden items-center gap-7 text-sm font-medium lg:flex">
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

        {/* Mobile nav (no dropdown) */}
        <div className="flex items-center justify-between gap-3 lg:hidden">
          <div className="min-w-0 overflow-x-auto">
            <MenuNav
              urls={urls}
              navigationItems={navigationItems}
              className="min-w-max flex-nowrap gap-4 whitespace-nowrap"
            />
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {actions}
            {showAuthButtons ? (
              <AuthButtons
                urls={urls}
                wrapWithProvider={authButtonsWrapWithProvider}
              />
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
