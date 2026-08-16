import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

export interface SuggestionSummary {
  user_name: string;
  status: "pending" | "accepted" | "rejected";
  created_at: number;
  suggestion: string | null;
}

export interface SuggestionInput {
  item_id: string;
  field: "title" | "summary";
  suggestion: string;
  user_id: string;
  user_name: string;
}

const MAX_LEN = 2000;

/**
 * Client-side pre-validation only — mirrors worker/suggestions.ts's
 * validateSuggestionText/MAX_SUGGESTION_LENGTH plus the sign-in
 * requirement, so the form can show an error before round-tripping to the
 * server. Kept local (not statically imported from worker/) so this pure
 * check doesn't drag worker-only code into the client bundle; the server
 * fn below dynamically imports worker/suggestions.ts for the real,
 * rate-limited check.
 */
export function validateSuggestion(input: SuggestionInput): string {
  const suggestion = input.suggestion.trim();
  if (!suggestion) throw new Error("Suggestion cannot be empty");
  if (suggestion.length > MAX_LEN) {
    throw new Error(`Suggestion must be ${MAX_LEN} characters or fewer`);
  }
  if (input.field !== "title" && input.field !== "summary") {
    throw new Error("Invalid field");
  }
  if (!input.item_id) throw new Error("Missing item_id");
  if (!input.user_id) throw new Error("Sign in required");
  return suggestion;
}

// NOTE: user_id/user_name are trusted as sent by the client for now — there
// is no server-side Clerk JWT verification yet. Abuse/spoofing is possible
// until that lands; suggestions are reviewed (LLM + status flag) before
// their text is shown to anyone but the author, which limits the blast
// radius in the meantime.
export const submitSuggestion = createServerFn({ method: "POST" })
  .inputValidator((input: SuggestionInput) => input)
  .handler(async ({ data }) => {
    if (!data.user_id) throw new Error("Sign in required");
    const { env } = await import("cloudflare:workers");
    const db = (env as { DB?: D1Database }).DB;
    if (!db) throw new Error("D1 binding DB not configured");

    const { submitSuggestion: submitSuggestionToDb } = await import(
      "../../worker/suggestions.js"
    );
    // Passed to the worker layer only to be hashed for per-IP rate
    // limiting — never stored or logged here.
    const ip = getRequestHeader("CF-Connecting-IP");
    const result = await submitSuggestionToDb(db, {
      itemId: data.item_id,
      field: data.field,
      suggestion: data.suggestion,
      userId: data.user_id,
      userName: data.user_name,
      ip,
    });
    if (!result.ok) throw new Error(result.error);
    return { id: result.id };
  });

export const fetchSuggestions = createServerFn({ method: "GET" })
  .inputValidator((input: { item_id: string }) => input)
  .handler(async ({ data }): Promise<SuggestionSummary[]> => {
    const { env } = await import("cloudflare:workers");
    const db = (env as { DB?: D1Database }).DB;
    if (!db) return [];
    try {
      // Only accepted suggestions expose their text — pending/rejected
      // stay count-only to avoid rendering unreviewed user text to others.
      const { results } = await db
        .prepare(
          `SELECT user_name, status, created_at,
                  CASE WHEN status = 'accepted' THEN suggestion ELSE NULL END AS suggestion
           FROM translation_suggestions
           WHERE item_id = ?
           ORDER BY created_at DESC
           LIMIT 50`
        )
        .bind(data.item_id)
        .all<SuggestionSummary>();
      return results ?? [];
    } catch {
      // translation_suggestions table may not exist yet (pre-migration)
      return [];
    }
  });
