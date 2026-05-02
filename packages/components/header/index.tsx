"use client";

import { cn } from "@duyet/libs/utils";
import type { Profile } from "@duyet/profile";
import { duyetProfile } from "@duyet/profile";
import type { UrlsConfig } from "@duyet/urls";
import { duyetUrls } from "@duyet/urls";
import { Menu as MenuIcon, X } from "lucide-react";
import Container from "../Container";
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
  className,
  containerClassName,
}: HeaderProps) {
  // Use profile defaults if not overridden
  const displayShortText = shortText ?? profile.personal.shortName;
  const displayLongText = longText ?? profile.personal.title;

  return (
    <header
      className={cn(
        "py-10",
        center ? "md:flex md:justify-center md:my-10" : "",
        className
      )}
    >
      <Container className={cn("mb-0", containerClassName)}>
        <nav
          className={cn(
            "flex items-center flex-wrap justify-between transition-all gap-4",
            center && "md:flex-col md:gap-10"
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
          <div className="hidden md:flex flex-row gap-3 sm:gap-5 flex-wrap items-center">
            <MenuNav
              urls={urls}
              navigationItems={navigationItems}
              className="gap-3 sm:gap-5"
            />
            <AuthButtons urls={urls} />
          </div>

          {/* Mobile: hamburger + auth */}
          <div className="flex items-center gap-3 md:hidden">
            <AuthButtons urls={urls} />
            <details className="group relative">
              <summary className="flex cursor-pointer list-none rounded p-1 text-neutral-700 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:text-neutral-300 dark:hover:text-neutral-100 dark:focus-visible:ring-neutral-500 [&::-webkit-details-marker]:hidden">
                <span className="sr-only">Toggle menu</span>
                <MenuIcon className="size-5 group-open:hidden" />
                <X className="hidden size-5 group-open:block" />
              </summary>
              <div className="absolute right-0 top-full z-50 mt-3 w-[min(260px,calc(100vw-2rem))] rounded-xl border border-neutral-200 bg-white p-4 shadow-lg dark:border-white/10 dark:bg-[#1a1a1a]">
                <MenuNav
                  urls={urls}
                  navigationItems={navigationItems}
                  className="flex-col items-start gap-3"
                />
              </div>
            </details>
          </div>
        </nav>
      </Container>
    </header>
  );
}
