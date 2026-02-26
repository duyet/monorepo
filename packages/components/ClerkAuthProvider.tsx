"use client";

import { lazy, Suspense, ReactNode, useEffect, useState } from "react";

// Lazy load ClerkProvider to avoid SSR issues with static export
const ClerkProvider = lazy(() =>
  import("@clerk/clerk-react").then((mod) => ({ default: mod.ClerkProvider }))
);

interface ClerkAuthProviderProps {
  children: ReactNode;
  publishableKey?: string;
}

/**
 * Clerk authentication provider wrapper for static exports
 *
 * Uses Clerk's React SDK with lazy loading to avoid SSR issues
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

function InnerClerkProvider({ children, publishableKey }: ClerkAuthProviderProps) {
  if (!publishableKey) {
    return <>{children}</>;
  }

  return (
    // @ts-ignore - ClerkProvider is dynamically imported
    <ClerkProvider
      publishableKey={publishableKey}
      afterSignInUrl="/"
      afterSignUpUrl="/"
    >
      {children}
    </ClerkProvider>
  );
}

export default function ClerkAuthProvider(props: ClerkAuthProviderProps) {
  const [isClient, setIsClient] = useState(false);
  const publishableKey = props.publishableKey ?? process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!publishableKey) {
    console.warn(
      "[ClerkAuthProvider] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not defined. Auth features will be disabled."
    );
    return <>{props.children}</>;
  }

  if (!isClient) {
    return <>{props.children}</>;
  }

  return (
    <Suspense fallback={<> {props.children}</>}>
      <InnerClerkProvider {...props} publishableKey={publishableKey} />
    </Suspense>
  );
}
