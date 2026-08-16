import { generateTldr } from "./llm.js";
import { toEpochSeconds } from "./time.js";
import type { Env } from "./types.js";

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

interface ItemRow {
  id: string;
  title: string;
  summary: string | null;
}

/** Idempotent daily gate: generates and stores a TL;DR snapshot once per UTC day. */
export async function ensureDailyTldr(env: Env): Promise<void> {
  const date = todayUtc();

  const existing = await env.DB.prepare(
    "SELECT date FROM tldr_snapshots WHERE date = ?"
  )
    .bind(date)
    .first();
  if (existing) return;

  // items.published_at is stored as epoch seconds.
  const since = toEpochSeconds(Date.now()) - 24 * 60 * 60;
  const { results } = await env.DB.prepare(
    `SELECT id, title, summary FROM items
     WHERE status = 'published' AND published_at >= ?
     ORDER BY rank_score DESC
     LIMIT 12`
  )
    .bind(since)
    .all<ItemRow>();

  if (!results || results.length === 0) return;

  const tldr = await generateTldr(
    env,
    results.map((row) => ({
      id: row.id,
      title: row.title,
      summary: row.summary ?? undefined,
    }))
  );

  await env.DB.prepare(
    `INSERT INTO tldr_snapshots (date, bullets_en, bullets_vi, created_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(date) DO UPDATE SET
       bullets_en = excluded.bullets_en,
       bullets_vi = excluded.bullets_vi,
       created_at = excluded.created_at`
  )
    .bind(
      date,
      JSON.stringify(tldr.bullets_en),
      JSON.stringify(tldr.bullets_vi),
      Date.now()
    )
    .run();
}
