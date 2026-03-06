"use client";

import { useEffect, useState } from "react";

export interface ClerkComponents {
  SignInButton: React.ComponentType<{
    mode?: string;
    children: React.ReactNode;
  }>;
  SignedIn: React.ComponentType<{ children: React.ReactNode }>;
  SignedOut: React.ComponentType<{ children: React.ReactNode }>;
  UserButton: React.ComponentType<{ appearance?: Record<string, unknown> }>;
  useUser: () => { isLoaded: boolean; isSignedIn: boolean; user: any };
}

// Singleton promise — import fires once regardless of how many consumers mount
let clerkPromise: Promise<ClerkComponents> | null = null;

function loadClerk(): Promise<ClerkComponents> | null {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) return null;
  if (!clerkPromise) {
    clerkPromise = import("@clerk/clerk-react").then((mod) => ({
      SignInButton: mod.SignInButton as any,
      SignedIn: mod.SignedIn as any,
      SignedOut: mod.SignedOut as any,
      UserButton: mod.UserButton as any,
      useUser: mod.useUser as any,
    }));
  }
  return clerkPromise;
}

/**
 * Dynamically loads Clerk components once and shares the result across all consumers.
 * Returns null while loading or if Clerk is not configured.
 */
export function useClerkComponents(): ClerkComponents | null {
  const [components, setComponents] = useState<ClerkComponents | null>(null);

  useEffect(() => {
    const promise = loadClerk();
    if (promise) {
      promise.then(setComponents);
    }
  }, []);

  return components;
}
