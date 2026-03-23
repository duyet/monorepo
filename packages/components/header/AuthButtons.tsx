"use client";

import type { UrlsConfig } from "@duyet/urls";
import { useEffect, useRef, useState } from "react";
import Icons from "../Icons";

// Track whether a ClerkProvider already exists in the page
let clerkProviderMounted = false;

/**
 * Auth button component for user authentication.
 *
 * Features:
 * - Dynamic Clerk import (only loads when key is present)
 * - Singleton guard for pages with multiple headers
 * - Optional urls config (defaults to current page for redirects)
 * - Customizable styling
 * - Auto-redirect back to current page after sign in/out
 * - Optional signedInContent for authenticated-only features
 * - Optional wrapWithProvider for apps with existing ClerkProvider
 *
 * @example
 * // Minimal usage (redirects to current page)
 * <AuthButtons />
 *
 * @example
 * // With authenticated-only content
 * <AuthButtons signedInContent={<a href="/api/data.json">Download</a>} />
 *
 * @example
 * // With custom styling
 * <AuthButtons className="rounded-lg p-2" />
 *
 * @example
 * // App already has ClerkProvider
 * <AuthButtons wrapWithProvider={false} />
 */
export function AuthButtons({
  urls,
  className = "",
  signInClassName = "h-8 w-8 flex items-center justify-center rounded-full text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors",
  avatarSize = "h-8 w-8",
  signedInContent = null,
  signedOutContent = null,
  wrapWithProvider = true,
}: {
  urls?: UrlsConfig;
  className?: string;
  signInClassName?: string;
  avatarSize?: string;
  signedInContent?: React.ReactNode | null;
  signedOutContent?: React.ReactNode | null;
  wrapWithProvider?: boolean;
} = {}) {
  const importMetaEnv =
    typeof import.meta !== "undefined"
      ? ((import.meta as unknown as Record<string, unknown>).env as
          | Record<string, string>
          | undefined)
      : undefined;
  const publishableKey = importMetaEnv?.VITE_CLERK_PUBLISHABLE_KEY;

  const [clerkModule, setClerkModule] = useState<any>(null);
  const [currentUrl, setCurrentUrl] = useState("");
  const isOwner = useRef(false);

  useEffect(() => {
    // Get current page URL for redirect
    setCurrentUrl(window.location.href);
  }, []);

  useEffect(() => {
    if (clerkProviderMounted) return;
    if (!publishableKey) return;

    clerkProviderMounted = true;
    isOwner.current = true;

    import("@clerk/clerk-react")
      .then((mod) => setClerkModule(mod))
      .catch(() => {
        // Clerk not available — isOwner stays true so fallback renders
      });

    return () => {
      if (isOwner.current) {
        clerkProviderMounted = false;
      }
    };
  }, [publishableKey]);

  // No publishable key — show unavailable fallback
  if (!publishableKey) {
    return (
      <button
        type="button"
        className={`${signInClassName} ${className}`.trim()}
        aria-label="Sign in (Unavailable)"
      >
        <Icons.UserEmpty className="h-4 w-4" />
      </button>
    );
  }

  // Key present but module not loaded yet — show nothing while loading
  if (!clerkModule || !isOwner.current) {
    return null;
  }

  const { ClerkProvider, SignedOut, SignedIn, SignInButton, UserButton } =
    clerkModule;

  if (!ClerkProvider || !SignedOut || !SignedIn || !SignInButton || !UserButton) {
    return (
      <button
        type="button"
        className={`${signInClassName} ${className}`.trim()}
        aria-label="Sign in (Unavailable)"
      >
        <Icons.UserEmpty className="h-4 w-4" />
      </button>
    );
  }

  // Use current page URL for redirect, fallback to blog
  const redirectUrl =
    currentUrl || urls?.apps?.blog || "https://blog.duyet.net";

  const content = (
    <>
      {signedOutContent && <SignedOut>{signedOutContent}</SignedOut>}
      {signedInContent && <SignedIn>{signedInContent}</SignedIn>}
      <SignedOut>
        <SignInButton mode="modal" redirectUrl={redirectUrl}>
          <button
            type="button"
            className={`${signInClassName} ${className}`.trim()}
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
              avatarBox: avatarSize,
            },
          }}
          afterSignOutUrl={redirectUrl}
        />
      </SignedIn>
    </>
  );

  return wrapWithProvider ? (
    <ClerkProvider publishableKey={publishableKey}>{content}</ClerkProvider>
  ) : (
    content
  );
}
