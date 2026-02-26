"use client";

import { cn } from "@duyet/libs/utils";
import type { Profile } from "@duyet/profile";
import { duyetProfile } from "@duyet/profile";
import type { UrlsConfig } from "@duyet/urls";
import { duyetUrls } from "@duyet/urls";
import Link from "next/link";
import { useState, useEffect } from "react";
import Container from "./Container";
import Icons from "./Icons";
import Logo from "./Logo";
import Menu, { type NavigationItem } from "./Menu";

// Self-contained auth button component
// Loads ClerkProvider + auth components in a single dynamic import
// to avoid race conditions between provider and consumer
function AuthButtons({ urls }: { urls: UrlsConfig }) {
  const [clerkModule, setClerkModule] = useState<any>(null);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    if (!key) return;

    import("@clerk/clerk-react")
      .then((mod) => setClerkModule(mod))
      .catch(() => {
        // Clerk not available, hide auth buttons
      });
  }, []);

  if (!clerkModule) return null;

  const { ClerkProvider, SignedOut, SignedIn, SignInButton, UserButton } = clerkModule;
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey || !ClerkProvider || !SignedOut || !SignedIn || !SignInButton || !UserButton) {
    return null;
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <SignedOut>
        <SignInButton mode="modal">
          <button
            type="button"
            className="h-8 w-8 flex items-center justify-center rounded-full border-2 border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-400 hover:border-neutral-900 dark:hover:border-neutral-100 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            aria-label="Sign in"
          >
            <Icons.UserEmpty className="h-4 w-4" />
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-8 w-8",
            },
          }}
          afterSignOutUrl={urls.apps.blog}
        />
      </SignedIn>
    </ClerkProvider>
  );
}

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

            <AuthButtons urls={urls} />
          </div>
        </nav>
      </Container>
    </header>
  );
}
