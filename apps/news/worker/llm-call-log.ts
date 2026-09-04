import type { LlmCallLogEntry } from "./llm.js";
import type { Env } from "./types.js";

const RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

/** Additive usage columns from migration 0016. Applied at runtime so local
 * / preview DBs keep logging before `wrangler d1 migrations apply`. */
const USAGE_COLUMNS_SQL = [
  "ALTER TABLE llm_calls ADD COLUMN prompt_tokens INTEGER",
  "ALTER TABLE llm_calls ADD COLUMN completion_tokens INTEGER",
  "ALTER TABLE llm_calls ADD COLUMN cached_tokens INTEGER",
];

let usageColumnsReady = false;

async function ensureUsageColumns(db: D1Database): Promise<void> {
  if (usageColumnsReady) return;
  for (const sql of USAGE_COLUMNS_SQL) {
    try {
      await db.prepare(sql).run();
    } catch {
      // Column already exists, or table not migrated yet — insert path
      // still falls back to the lean 0013 INSERT below.
    }
  }
  usageColumnsReady = true;
}

/** Test helper — Worker isolate is long-lived; tests share the module. */
export function resetLlmCallLogSchemaCache(): void {
  usageColumnsReady = false;
}

/**
 * Builds a `setLlmCallLogger`-compatible sink that persists each entry to
 * D1's `llm_calls` table. Best-effort: an insert failure is logged and
 * swallowed, never rethrown — the anyrouter fallback loop that calls this
 * must never fail or slow down because observability logging broke.
 */
export function createD1LlmCallLogger(
  env: Env
): (entry: LlmCallLogEntry) => Promise<void> {
  return async (entry) => {
    try {
      await ensureUsageColumns(env.DB);
      try {
        await env.DB.prepare(
          `INSERT INTO llm_calls (
             ts, task, model, ok, tokens, duration_ms, error,
             prompt_chars, response_snippet,
             prompt_tokens, completion_tokens, cached_tokens
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
          .bind(
            entry.ts,
            entry.task,
            entry.model,
            entry.ok ? 1 : 0,
            entry.tokens,
            entry.durationMs,
            entry.error,
            entry.promptChars,
            entry.responseSnippet,
            entry.promptTokens,
            entry.completionTokens,
            entry.cachedTokens
          )
          .run();
        return;
      } catch {
        // Pre-0016 DB or ensureUsageColumns failed: fall back to lean insert.
      }
      await env.DB.prepare(
        `INSERT INTO llm_calls (ts, task, model, ok, tokens, duration_ms, error, prompt_chars, response_snippet)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(
          entry.ts,
          entry.task,
          entry.model,
          entry.ok ? 1 : 0,
          entry.tokens,
          entry.durationMs,
          entry.error,
          entry.promptChars,
          entry.responseSnippet
        )
        .run();
    } catch (error) {
      console.error("llm_calls insert failed:", error);
    }
  };
}

/**
 * Best-effort retention: deletes `llm_calls` rows older than 7 days.
 * Called once per workflow run rather than after every insert, since a run
 * only ever adds a bounded handful of rows. Never throws.
 */
export async function pruneLlmCalls(env: Env): Promise<void> {
  try {
    await env.DB.prepare("DELETE FROM llm_calls WHERE ts < ?")
      .bind(Date.now() - RETENTION_MS)
      .run();
  } catch (error) {
    console.error("llm_calls retention delete failed:", error);
  }
}
