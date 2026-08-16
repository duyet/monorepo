import { useEffect, useRef, useState } from "react";
import { useClerkModule } from "./clerk-user";

export interface AdminState {
  isAdmin: boolean;
  loading: boolean;
  /** Resolves the current Clerk session token, or null if unavailable. */
  getToken: () => Promise<string | null>;
}

/**
 * SSR-safe admin check. Renders nothing extra when Clerk is absent or the
 * user is signed out — /api/admin/me is only called once Clerk reports a
 * signed-in session, and always returns {isAdmin: false} in that case.
 */
export function useAdmin(): AdminState {
  const { mod, publishableKey } = useClerkModule();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const checkedRef = useRef(false);

  // mod/publishableKey are stable for the lifetime of a given mount: the
  // app tree fully remounts once Clerk finishes loading (see __root.tsx),
  // so this conditional hook call never toggles mid-mount.
  const hasClerk = Boolean(mod && publishableKey);
  const auth = hasClerk ? mod!.useAuth() : null;
  const isSignedIn = auth?.isSignedIn ?? false;
  const getTokenFn = auth?.getToken ?? null;

  useEffect(() => {
    if (!isSignedIn || !getTokenFn || checkedRef.current) return;
    checkedRef.current = true;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const token = await getTokenFn();
        if (!token) return;
        const res = await fetch("/api/admin/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = (await res.json()) as { admin: boolean };
        if (!cancelled) setIsAdmin(Boolean(data.admin));
      } catch {
        // network/parse failure — stay non-admin
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isSignedIn, getTokenFn]);

  return {
    isAdmin,
    loading,
    getToken: async () => {
      if (!getTokenFn) return null;
      return getTokenFn();
    },
  };
}
