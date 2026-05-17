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
  simpleAvatar = false,
}: {
  urls?: UrlsConfig;
  className?: string;
  signInClassName?: string;
  avatarSize?: string;
  signedInContent?: React.ReactNode | null;
  signedOutContent?: React.ReactNode | null;
  wrapWithProvider?: boolean;
  simpleAvatar?: boolean;
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
    if (!publishableKey) return;

    if (wrapWithProvider) {
      if (clerkProviderMounted) return;
      clerkProviderMounted = true;
      isOwner.current = true;
    } else {
      isOwner.current = true;
    }

    import("@clerk/clerk-react")
      .then((mod) => setClerkModule(mod))
      .catch(() => {
        // Clerk not available — isOwner stays true so fallback renders
      });

    return () => {
      if (isOwner.current && wrapWithProvider) {
        clerkProviderMounted = false;
      }
    };
  }, [publishableKey, wrapWithProvider]);

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

  const {
    ClerkProvider,
    SignedOut,
    SignedIn,
    SignInButton,
    UserButton,
    useUser,
    useClerk,
  } = clerkModule;

  if (
    !ClerkProvider ||
    !SignedOut ||
    !SignedIn ||
    !SignInButton ||
    !UserButton
  ) {
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
        {simpleAvatar ? (
          <SimpleAvatar
            useUser={useUser}
            useClerk={useClerk}
            avatarSize={avatarSize}
            redirectUrl={redirectUrl}
          />
        ) : (
          <UserButton
            appearance={{
              elements: {
                avatarBox: avatarSize,
              },
            }}
            afterSignOutUrl={redirectUrl}
          />
        )}
      </SignedIn>
    </>
  );

  return wrapWithProvider ? (
    <ClerkProvider publishableKey={publishableKey}>{content}</ClerkProvider>
  ) : (
    content
  );
}

function SimpleAvatar({
  useUser,
  useClerk,
  avatarSize,
  redirectUrl,
}: {
  useUser: () => { user?: { imageUrl?: string; fullName?: string | null; primaryEmailAddress?: { emailAddress?: string } | null } | null };
  useClerk: () => { signOut: (opts?: { redirectUrl?: string }) => Promise<void> };
  avatarSize: string;
  redirectUrl: string;
}) {
  const { user } = useUser();
  const { signOut } = useClerk();
  if (!user) return null;

  const label =
    user.fullName ||
    user.primaryEmailAddress?.emailAddress ||
    "Account";

  return (
    <button
      type="button"
      onClick={() => signOut({ redirectUrl })}
      aria-label={`Sign out (${label})`}
      title={`Sign out (${label})`}
      className={`group relative ${avatarSize} overflow-hidden rounded-full ring-1 ring-[var(--hairline)] transition-all hover:ring-[var(--foreground)]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--foreground)]/60`}
    >
      {user.imageUrl ? (
        <img
          src={user.imageUrl}
          alt=""
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center bg-[var(--muted)] text-[10px] font-medium text-[var(--muted-foreground)]">
          {label.slice(0, 1).toUpperCase()}
        </span>
      )}
    </button>
  );
}
