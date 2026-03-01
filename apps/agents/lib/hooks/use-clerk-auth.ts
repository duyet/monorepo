"use client";

import { useCallback } from "react";

/**
 * Hook that returns a stable function to get the Clerk session token.
 * Dynamically accesses the Clerk global instance to get the current session token.
 * Returns undefined if Clerk is not configured.
 */
export function useClerkAuthToken(): (() => Promise<string | null>) | undefined {
  const getToken = useCallback(async (): Promise<string | null> => {
    try {
      const clerk = (window as any).Clerk;
      if (clerk?.session) {
        return await clerk.session.getToken();
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return undefined;
  }

  return getToken;
}
