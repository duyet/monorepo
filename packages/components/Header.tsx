"use client";

import { cn } from "@duyet/libs/utils";
import type { Profile } from "@duyet/profile";
import { duyetProfile } from "@duyet/profile";
import type { UrlsConfig } from "@duyet/urls";
import { duyetUrls } from "@duyet/urls";
import Link from "next/link";
import { useState, useEffect } from "react";
import Container from "./Container";
import Logo from "./Logo";
import Menu, { type NavigationItem } from "./Menu";

// Clerk auth components from JavaScript SDK
// These are client-side only and work with static exports
// We use lazy loading to avoid SSR issues with static export
import { lazy, Suspense } from "react";

const ClerkSignedOut = lazy(() =>
  import("@clerk/clerk-react").then((mod) => ({ default: mod.SignedOut }))
);
const ClerkSignedIn = lazy(() =>
  import("@clerk/clerk-react").then((mod) => ({ default: mod.SignedIn }))
);
const ClerkSignInButton = lazy(() =>
  import("@clerk/clerk-react").then((mod) => ({ default: mod.SignInButton }))
);
const ClerkUserButton = lazy(() =>
  import("@clerk/clerk-react").then((mod) => ({ default: mod.UserButton }))
);

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
 * Header component with logo, branding, and navigation
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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
          <div className={cn("flex flex-row items-center gap-2")}>
            {logo && (
              <Logo
                className={center ? "md:flex-col" : ""}
                logoClassName={center ? "md:w-40 md:h-40" : ""}
              />
            )}

            <Link
              href={urls.apps.home}
              className={cn(
                "font-serif text-xl sm:text-2xl font-normal text-neutral-900 dark:text-neutral-100",
                className
              )}
            >
              {displayShortText && displayLongText ? (
                <>
                  <span className="block sm:hidden">{displayShortText}</span>
                  <span
                    className={cn(
                      "hidden sm:block",
                      center && "md:text-7xl md:mt-5"
                    )}
                  >
                    {displayLongText}
                  </span>
                </>
              ) : (
                <span>{displayShortText || displayLongText}</span>
              )}
            </Link>
          </div>

          <div className="flex flex-row gap-3 sm:gap-5 flex-wrap items-center">
            <Menu urls={urls} navigationItems={navigationItems} className="gap-3 sm:gap-5" />

            {/* Clerk Auth Buttons - client-side only with lazy loading */}
            {isClient && (
              <Suspense fallback={null}>
                <ClerkSignedOut>
                  <ClerkSignInButton mode="modal">
                    <button
                      type="button"
                      className="text-sm sm:text-base text-neutral-900 dark:text-neutral-100 hover:underline underline-offset-8"
                    >
                      Sign in
                    </button>
                  </ClerkSignInButton>
                </ClerkSignedOut>
                <ClerkSignedIn>
                  <ClerkUserButton
                    appearance={{
                      elements: {
                        avatarBox: "h-8 w-8",
                      },
                    }}
                    afterSignOutUrl={urls.apps.blog}
                  />
                </ClerkSignedIn>
              </Suspense>
            )}
          </div>
        </nav>
      </Container>
    </header>
  );
}
