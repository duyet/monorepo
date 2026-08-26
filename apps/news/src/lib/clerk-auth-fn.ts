import { getRequestHeader } from "@tanstack/react-start/server";
import type { ClerkPayload } from "../../worker/admin/clerk.js";
import type { Env } from "../../worker/types.js";

function bearerToken(): string | null {
  const authHeader = getRequestHeader("Authorization") ?? "";
  const match = authHeader.match(/^Bearer (.+)$/);
  return match?.[1] ?? null;
}

function displayName(payload: ClerkPayload): string {
  if (typeof payload.name === "string" && payload.name.trim()) {
    return payload.name.trim();
  }
  const first =
    typeof payload.first_name === "string"
      ? payload.first_name
      : typeof payload.given_name === "string"
        ? payload.given_name
        : "";
  const last =
    typeof payload.last_name === "string"
      ? payload.last_name
      : typeof payload.family_name === "string"
        ? payload.family_name
        : "";
  const combined = [first, last].filter(Boolean).join(" ");
  if (combined) return combined;
  if (typeof payload.username === "string" && payload.username.trim()) {
    return payload.username.trim();
  }
  return payload.sub;
}

/** Verifies the caller's Clerk session JWT from Authorization: Bearer.
 * Derives user_id/user_name server-side — never trust client-supplied values. */
export async function requireClerkUser(): Promise<{
  userId: string;
  userName: string;
}> {
  const token = bearerToken();
  if (!token) throw new Error("Sign in required");

  const { env } = await import("cloudflare:workers");
  const { verifyClerkToken } = await import("../../worker/admin/clerk.js");
  const payload = await verifyClerkToken(token, env as Env);
  if (!payload) throw new Error("Sign in required");

  return { userId: payload.sub, userName: displayName(payload) };
}
