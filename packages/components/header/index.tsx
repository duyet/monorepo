"use client";

import { cn } from "@duyet/libs/utils";
import type { Profile } from "@duyet/profile";
import { duyetProfile } from "@duyet/profile";
import type { UrlsConfig } from "@duyet/urls";
import { duyetUrls } from "@duyet/urls";
import { Menu as MenuIcon, X } from "lucide-react";
import { useState } from "react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              className="p-1 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-500 rounded"
            >
              {mobileMenuOpen ? (
                <X className="size-5" />
              ) : (
                <MenuIcon className="size-5" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 dark:border-neutral-700 mt-4 pt-4">
            <MenuNav
              urls={urls}
              navigationItems={navigationItems}
              className="flex-col gap-3"
              onItemClick={() => setMobileMenuOpen(false)}
            />
          </div>
        )}
      </Container>
    </header>
  );
}
