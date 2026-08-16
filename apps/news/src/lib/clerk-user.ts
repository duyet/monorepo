import { createContext, useContext, useEffect, useState } from "react";

export interface ClerkModuleState {
  mod: typeof import("@clerk/clerk-react") | null;
  publishableKey: string | undefined;
}

const EMPTY_STATE: ClerkModuleState = { mod: null, publishableKey: undefined };

/**
 * Shared across every Clerk consumer (AuthButtons via wrapWithProvider={false},
 * SuggestTranslation, the submit page). __root.tsx owns the ONE dynamic
 * import + the ONE <ClerkProvider> and publishes it here — every consumer
 * just reads this context and renders Clerk's SignedIn/SignedOut/useUser
 * primitives directly, never mounting a second provider (a second
 * <ClerkProvider> crashes the whole app).
 */
export const ClerkModuleContext = createContext<ClerkModuleState>(EMPTY_STATE);

export function useClerkModule(): ClerkModuleState {
  return useContext(ClerkModuleContext);
}

/** Only called once, in __root.tsx, to perform the dynamic import. */
export function useClerkModuleLoader(): ClerkModuleState {
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
    import("@clerk/clerk-react")
      .then((m) => {
        if (!cancelled) setMod(m);
      })
      .catch(() => {
        // Clerk failed to load — consumers fall back to signed-out state
      });
    return () => {
      cancelled = true;
    };
  }, [publishableKey]);

  return { mod, publishableKey };
}
