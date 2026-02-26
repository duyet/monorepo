"use client";

import type { UrlsConfig } from "@duyet/urls";
import { useState, useEffect, useRef } from "react";
import Icons from "../Icons";

// Track whether a ClerkProvider already exists in the page
let clerkProviderMounted = false;

/**
 * Self-contained auth button component.
 * Loads ClerkProvider + auth components in a single dynamic import.
 * Uses a singleton guard to prevent multiple ClerkProviders on pages
 * with more than one Header (e.g. CV has header at top and bottom).
 */
export function AuthButtons({ urls }: { urls: UrlsConfig }) {
  const [clerkModule, setClerkModule] = useState<any>(null);
  const isOwner = useRef(false);

  useEffect(() => {
    if (clerkProviderMounted) return;

    const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    if (!key) return;

    clerkProviderMounted = true;
    isOwner.current = true;

    import("@clerk/clerk-react")
      .then((mod) => setClerkModule(mod))
      .catch(() => {
        // Clerk not available, hide auth buttons
      });

    return () => {
      if (isOwner.current) {
        clerkProviderMounted = false;
      }
    };
  }, []);

  if (!clerkModule || !isOwner.current) return null;

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
            className="h-8 w-8 flex items-center justify-center rounded-full text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
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
