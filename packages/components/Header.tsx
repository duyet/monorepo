"use client";

import { cn } from "@duyet/libs/utils";
import type { Profile } from "@duyet/profile";
import { duyetProfile } from "@duyet/profile";
import type { UrlsConfig } from "@duyet/urls";
import { duyetUrls } from "@duyet/urls";
import Link from "next/link";
import { useState, useEffect } from "react";
import Container from "./Container";
import ClerkAuthProvider from "./ClerkAuthProvider";
import Icons from "./Icons";
import Logo from "./Logo";
import Menu, { type NavigationItem } from "./Menu";

// Inline auth button component that only renders when Clerk is available
function AuthButtons({ urls }: { urls: UrlsConfig }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [SignedOut, setSignedOut] = useState<React.ComponentType<any> | null>(null);
  const [SignedIn, setSignedIn] = useState<React.ComponentType<any> | null>(null);
  const [SignInButton, setSignInButton] = useState<React.ComponentType<any> | null>(null);
  const [UserButton, setUserButton] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    // Dynamically import Clerk components only on client side
    import("@clerk/clerk-react")
      .then((mod) => {
        setSignedOut(() => mod.SignedOut);
        setSignedIn(() => mod.SignedIn);
        setSignInButton(() => mod.SignInButton);
        setUserButton(() => mod.UserButton);
        setIsLoaded(true);
      })
      .catch(() => {
        // Clerk not available, just hide auth buttons
        setIsLoaded(true);
      });
  }, []);

  if (!isLoaded || !SignedOut || !SignedIn || !SignInButton || !UserButton) {
    return null;
  }

  return (
    <>
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
    </>
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

            {/* Clerk Auth Buttons - wrapped with ClerkAuthProvider */}
            <ClerkAuthProvider>
              <AuthButtons urls={urls} />
            </ClerkAuthProvider>
          </div>
        </nav>
      </Container>
    </header>
  );
}
