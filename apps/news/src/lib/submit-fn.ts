import { createServerFn } from "@tanstack/react-start";

export interface SubmissionInput {
  url: string;
  title: string;
  note: string;
  user_id: string;
  user_name: string;
}

export interface Submission {
  id: string;
  url: string;
  title: string;
  status: "pending" | "accepted" | "rejected";
  created_at: number;
  review_note: string | null;
}

const TITLE_MIN = 5;
const TITLE_MAX = 300;

/**
 * Shared validation for a story submission. Kept in sync with the
 * worker/D1 constraints the backend enforces. Exported separately so it's
 * unit-testable without touching D1/Cloudflare bindings.
 */
export function validateSubmission(input: SubmissionInput): {
  url: string;
  title: string;
} {
  const title = input.title.trim();
  if (title.length < TITLE_MIN || title.length > TITLE_MAX) {
    throw new Error(`Title must be ${TITLE_MIN}-${TITLE_MAX} characters`);
  }
  let url: URL;
  try {
    url = new URL(input.url.trim());
  } catch {
    throw new Error("Invalid URL");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("URL must be http(s)");
  }
  if (!input.user_id) throw new Error("Sign in required");
  return { url: url.toString(), title };
}

// NOTE: user_id/user_name are trusted as sent by the client for now — there
// is no server-side Clerk JWT verification yet.
export const submitStory = createServerFn({ method: "POST" })
  .inputValidator((input: SubmissionInput) => input)
  .handler(async ({ data }) => {
    if (!data.user_id) throw new Error("Sign in required");
    const { env } = await import("cloudflare:workers");
    const db = (env as { DB?: D1Database }).DB;
    if (!db) throw new Error("D1 binding DB not configured");

    const { submitStory: submitStoryToDb } = await import(
      "../../worker/submissions.js"
    );
    const result = await submitStoryToDb(db, {
      url: data.url,
      title: data.title,
      note: data.note,
      userId: data.user_id,
      userName: data.user_name,
    });
    if (!result.ok) throw new Error(result.error);
    return { id: result.id };
  });

export const fetchMySubmissions = createServerFn({ method: "GET" })
  .inputValidator((input: { user_id: string }) => input)
  .handler(async ({ data }): Promise<Submission[]> => {
    const { env } = await import("cloudflare:workers");
    const db = (env as { DB?: D1Database }).DB;
    if (!db || !data.user_id) return [];
    try {
      const { results } = await db
        .prepare(
          `SELECT id, url, title, status, created_at, review_note
           FROM submissions
           WHERE user_id = ?
           ORDER BY created_at DESC
           LIMIT 50`
        )
        .bind(data.user_id)
        .all<Submission>();
      return results ?? [];
    } catch {
      // submissions table may not exist yet (pre-migration)
      return [];
    }
  });
