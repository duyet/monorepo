"use client";

import { ReactNode, useEffect, useState } from "react";

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
 * <ClerkAuthProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
 *   <App />
 * </ClerkAuthProvider>
 * ```
 */

function isValidPublishableKey(key: string): boolean {
  // Clerk publishable keys start with pk_test_ or pk_live_
  return /^(pk_test_|pk_live_)[A-Za-z0-9_-]+$/.test(key);
}

function InnerClerkProvider({ children, publishableKey }: ClerkAuthProviderProps & { publishableKey: string }) {
  const [ClerkProvider, setClerkProvider] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    import("@clerk/clerk-react")
      .then((mod) => {
        setClerkProvider(() => mod.ClerkProvider);
      })
      .catch((err) => {
        console.error("Failed to load Clerk:", err);
        setError(err as Error);
      });
  }, []);

  if (error) {
    console.warn("[ClerkAuthProvider] Failed to load Clerk, rendering without auth:", error.message);
    return <>{children}</>;
  }

  if (!ClerkProvider) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
    >
      {children}
    </ClerkProvider>
  );
}

export default function ClerkAuthProvider(props: ClerkAuthProviderProps) {
  const publishableKey = props.publishableKey ?? process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    console.warn(
      "[ClerkAuthProvider] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not defined. Auth features will be disabled."
    );
    return <>{props.children}</>;
  }

  if (!isValidPublishableKey(publishableKey)) {
    console.warn(
      `[ClerkAuthProvider] Invalid publishable key format (starts with: ${publishableKey.slice(0, 8)}...). Auth features will be disabled.`
    );
    return <>{props.children}</>;
  }

  return <InnerClerkProvider {...props} publishableKey={publishableKey} />;
}
