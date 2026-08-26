import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requireClerkUser } from "./clerk-auth-fn";

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
  user_id?: string;
  user_name?: string;
}

const MAX_LEN = 2000;

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

export const submitSuggestion = createServerFn({ method: "POST" })
  .inputValidator((input: SuggestionInput) => input)
  .handler(async ({ data }) => {
    const { userId, userName } = await requireClerkUser();
    const { env } = await import("cloudflare:workers");
    const db = (env as { DB?: D1Database }).DB;
    if (!db) throw new Error("D1 binding DB not configured");

    const { submitSuggestion: submitSuggestionToDb } = await import(
      "../../worker/suggestions.js"
    );
    const ip = getRequest().cf
      ? (getRequest().headers.get("CF-Connecting-IP") ?? null)
      : null;
    const result = await submitSuggestionToDb(db, {
      itemId: data.item_id,
      field: data.field,
      suggestion: data.suggestion,
      userId,
      userName,
      ip: ip ?? undefined,
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
      return [];
    }
  });
