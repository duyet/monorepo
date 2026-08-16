import { useEffect, useState } from "react";

/**
 * Loads the @clerk/clerk-react module for consumers that need Clerk's
 * <SignedIn>/<SignedOut>/useUser primitives outside of @duyet/components'
 * <AuthButtons> (which owns its own <ClerkProvider>). Callers must wrap
 * their subtree in their own <ClerkProvider publishableKey> once `mod` and
 * `publishableKey` are both available — this mirrors AuthButtons' own
 * dynamic-import technique.
 *
 * Trade-off: this mounts a second Clerk client instance alongside
 * AuthButtons'. Both independently read the same browser session, so the
 * signed-in state stays consistent, but it's not maximally efficient —
 * fine for now given the small surface (suggestion form, submit page).
 */
export function useClerkModule() {
  const [mod, setMod] = useState<typeof import("@clerk/clerk-react") | null>(
    null
  );

  const env =
    typeof import.meta !== "undefined"
      ? ((import.meta as unknown as Record<string, unknown>).env as
          | Record<string, string>
          | undefined)
      : undefined;
  const publishableKey = env?.VITE_CLERK_PUBLISHABLE_KEY;

  useEffect(() => {
    if (!publishableKey) return;
    let cancelled = false;
    import("@clerk/clerk-react").then((m) => {
      if (!cancelled) setMod(m);
    });
    return () => {
      cancelled = true;
    };
  }, [publishableKey]);

  return { mod, publishableKey };
}
