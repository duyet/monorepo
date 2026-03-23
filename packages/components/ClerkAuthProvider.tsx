"use client";

import { type ReactNode, useEffect, useState } from "react";

interface ClerkAuthProviderProps {
  children: ReactNode;
  publishableKey?: string;
}

/**
 * Clerk authentication provider wrapper for static exports
 *
 * Uses Clerk's React SDK with dynamic loading to avoid SSR issues
 * with Next.js static export (output: 'export').
 *
 * @example
 * ```tsx
 * import { ClerkAuthProvider } from '@duyet/components'
 *
 * <ClerkAuthProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
 *   <App />
 * </ClerkAuthProvider>
 * ```
 */

function isValidPublishableKey(key: string): boolean {
  // Clerk publishable keys start with pk_test_ or pk_live_
  return /^(pk_test_|pk_live_)[A-Za-z0-9_-]+$/.test(key);
}

// Client-side only wrapper that handles dynamic Clerk loading
function ClientClerkProvider({
  children,
  publishableKey,
}: {
  children: ReactNode;
  publishableKey: string;
}) {
  const [ClerkProvider, setClerkProvider] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    import("@clerk/clerk-react")
      .then((mod) => {
        setClerkProvider(() => mod.ClerkProvider);
        setIsReady(true);
      })
      .catch((err) => {
        console.error("Failed to load Clerk:", err);
        setError(err as Error);
        setIsReady(true);
      });
  }, []);

  if (error) {
    console.warn("[ClerkAuthProvider] Failed to load Clerk:", error.message);
    return <>{children}</>;
  }

  // Don't render children until ClerkProvider is ready
  // This prevents SignedOut/SignedIn from rendering without context
  if (!isReady || !ClerkProvider) {
    return null;
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>{children}</ClerkProvider>
  );
}

export default function ClerkAuthProvider(props: ClerkAuthProviderProps) {
  const [isClient, setIsClient] = useState(false);
  const importMetaEnv =
    typeof import.meta !== "undefined"
      ? ((import.meta as unknown as Record<string, unknown>).env as
          | Record<string, string>
          | undefined)
      : undefined;
  const publishableKey =
    props.publishableKey ?? importMetaEnv?.VITE_CLERK_PUBLISHABLE_KEY;

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!publishableKey) {
    console.warn(
      "[ClerkAuthProvider] VITE_CLERK_PUBLISHABLE_KEY is not defined. Auth features will be disabled."
    );
    return <>{props.children}</>;
  }

  if (!isValidPublishableKey(publishableKey)) {
    console.warn(
      `[ClerkAuthProvider] Invalid publishable key format. Auth features will be disabled.`
    );
    return <>{props.children}</>;
  }

  // Only render ClerkProvider on client side to avoid SSR issues
  if (!isClient) {
    return null;
  }

  return (
    <ClientClerkProvider publishableKey={publishableKey}>
      {props.children}
    </ClientClerkProvider>
  );
}
