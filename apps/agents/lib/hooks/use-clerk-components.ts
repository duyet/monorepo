import type {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/clerk-react";
import { useEffect, useState } from "react";

export interface ClerkComponents {
  SignInButton: typeof SignInButton;
  SignedIn: typeof SignedIn;
  SignedOut: typeof SignedOut;
  UserButton: typeof UserButton;
  useUser: typeof useUser;
}

// Singleton promise — import fires once regardless of how many consumers mount
let clerkPromise: Promise<ClerkComponents> | null = null;

function loadClerk(): Promise<ClerkComponents> | null {
  if (!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) return null;
  if (!clerkPromise) {
    clerkPromise = import("@clerk/clerk-react")
      .then((mod) => ({
        SignInButton: mod.SignInButton,
        SignedIn: mod.SignedIn,
        SignedOut: mod.SignedOut,
        UserButton: mod.UserButton,
        useUser: mod.useUser,
      }))
      .catch((err) => {
        clerkPromise = null;
        throw err;
      });
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
      promise.then(setComponents).catch(() => {});
    }
  }, []);

  return components;
}
