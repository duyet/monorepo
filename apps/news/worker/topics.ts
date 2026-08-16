import { callAnyrouter, parseJson } from "./llm.js";
import type { Env } from "./types.js";

/** Cap on canonical topics stored per item — mirrors the scoring prompt's
 * "3-6 topics" guidance with headroom for a merge-time union. */
export const MAX_TAGS_PER_ITEM = 6;
/** Cap after a merge-similar union of two (or more) items' topics. */
export const MAX_MERGED_TOPICS = 8;
/** Bounds the mapping prompt's size — only the most-used existing
 * canonicals are worth showing the model as reuse candidates. */
export const MAX_EXISTING_CANONICALS_IN_PROMPT = 150;

/**
 * Rules-based normalization, applied before any LLM call: lowercase, trim,
 * spaces/underscores collapse to a single dash, anything that isn't
 * [a-z0-9-] is dropped, repeated dashes collapse, leading/trailing dashes
 * trimmed. Turns "Open Source", "open_source", "OPEN-SOURCE " all into
 * "open-source".
 */
export function normalizeTopicName(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Normalizes and dedupes a raw tag list, dropping anything that
 * normalizes to empty (e.g. pure punctuation). */
export function dedupeNormalized(tags: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const tag of tags) {
    const normalized = normalizeTopicName(tag);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    out.push(normalized);
  }
  return out;
}

/** Unions two topic lists, deduped, capped at `cap`, base first. Used both
 * for the LLM canonical-mapping fallback path and for merge-similar's
 * cross-item topic union. */
export function unionTopics(
  base: string[],
  incoming: string[],
  cap: number
): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const topic of [...base, ...incoming]) {
    if (out.length >= cap) break;
    if (seen.has(topic)) continue;
    seen.add(topic);
    out.push(topic);
  }
  return out;
}

function buildTopicMappingPrompt(
  unseen: string[],
  existingCanonicals: string[]
): string {
  return `You are maintaining a canonical topic taxonomy for an AI/tech news site. Topic names are lowercase-kebab-case, a mix of entities (anthropic, openai, nvidia) and themes (open-source, multi-agent, fine-tuning).

Existing canonical topics (reuse one of these whenever the concept is the same — never create a near-duplicate like "opensource" when "open-source" already exists, or "llms" when "llm" already exists; always prefer the singular, standard form):
${JSON.stringify(existingCanonicals)}

For each of the following NEW topic name candidates, decide: does it mean the same concept as one of the existing canonical topics above? If so, map it to that exact existing canonical string. If it's a genuinely new concept not covered above, map it to itself (its own normalized form becomes a new canonical).

New candidates:
${JSON.stringify(unseen)}

Respond with strict JSON only: {"mappings":[{"name":"llms","canonical":"llm"}]}`;
}

/**
 * Defensively parses the topic-mapping model's JSON. Every `unseen` name
 * defaults to mapping to itself (i.e. becoming its own new canonical);
 * only a well-formed `{name, canonical}` pair for a name we actually
 * asked about overrides that default. A malformed/unparseable response
 * degrades to "every unseen name becomes its own canonical" rather than
 * failing the run.
 */
export function parseTopicMappingResponse(
  raw: string,
  unseen: string[]
): Map<string, string> {
  const result = new Map<string, string>();
  for (const name of unseen) result.set(name, name);

  try {
    const parsed = parseJson<{ mappings?: unknown }>(raw);
    if (!Array.isArray(parsed.mappings)) return result;
    for (const entry of parsed.mappings) {
      if (!entry || typeof entry !== "object") continue;
      const e = entry as Record<string, unknown>;
      if (typeof e.name !== "string" || typeof e.canonical !== "string") {
        continue;
      }
      const name = normalizeTopicName(e.name);
      const canonical = normalizeTopicName(e.canonical);
      if (!name || !canonical || !result.has(name)) continue;
      result.set(name, canonical);
    }
  } catch {
    // keep the identity-mapping defaults
  }
  return result;
}

async function mapUnseenTopics(
  env: Env,
  unseen: string[],
  existingCanonicals: string[]
): Promise<Map<string, string>> {
  if (unseen.length === 0) return new Map();

  const identity = new Map(unseen.map((name) => [name, name]));
  const prompt = buildTopicMappingPrompt(
    unseen,
    existingCanonicals.slice(0, MAX_EXISTING_CANONICALS_IN_PROMPT)
  );

  try {
    const { content } = await callAnyrouter(
      env,
      [{ role: "user", content: prompt }],
      { json: true, modelSpec: env.ANYROUTER_MODEL }
    );
    return parseTopicMappingResponse(content, unseen);
  } catch (error) {
    console.error("mapUnseenTopics failed:", error);
    return identity;
  }
}

/**
 * Normalizes every item's raw score tags into canonical topic names,
 * persisting a per-variant row in the `topics` table (name -> canonical,
 * with a running `count`/`last_seen`) so the mapping is stable and
 * traceable across runs, and returns the rewritten canonical tags to use
 * in place of the raw ones before write-d1. New/unseen variants are
 * batched into a single LLM call per run.
 */
export async function normalizeTopics(
  env: Env,
  rawTagsByItem: Map<string, string[]>,
  now: number
): Promise<Map<string, string[]>> {
  const normalizedTagsByItem = new Map<string, string[]>();
  const allNormalized = new Set<string>();
  for (const [itemId, rawTags] of rawTagsByItem) {
    const normalized = dedupeNormalized(rawTags);
    normalizedTagsByItem.set(itemId, normalized);
    for (const name of normalized) allNormalized.add(name);
  }

  const canonicalTagsByItem = new Map<string, string[]>();
  if (allNormalized.size === 0) {
    for (const itemId of rawTagsByItem.keys())
      canonicalTagsByItem.set(itemId, []);
    return canonicalTagsByItem;
  }

  const { results: existingRows } = await env.DB.prepare(
    "SELECT name, canonical FROM topics"
  ).all<{ name: string; canonical: string }>();
  const existingByName = new Map(
    (existingRows ?? []).map((r) => [r.name, r.canonical])
  );
  const existingCanonicals = [
    ...new Set((existingRows ?? []).map((r) => r.canonical)),
  ];

  const unseen = [...allNormalized].filter((name) => !existingByName.has(name));
  const mapping = await mapUnseenTopics(env, unseen, existingCanonicals);

  const resolvedByName = new Map<string, string>();
  for (const name of allNormalized) {
    resolvedByName.set(
      name,
      existingByName.get(name) ?? mapping.get(name) ?? name
    );
  }

  const occurrences = new Map<string, number>();
  for (const normalized of normalizedTagsByItem.values()) {
    for (const name of normalized) {
      occurrences.set(name, (occurrences.get(name) ?? 0) + 1);
    }
  }

  const statements: D1PreparedStatement[] = [];
  for (const [name, canonical] of resolvedByName) {
    statements.push(
      env.DB.prepare(
        `INSERT INTO topics (name, canonical, count, last_seen)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(name) DO UPDATE SET
           canonical = excluded.canonical,
           count = count + excluded.count,
           last_seen = excluded.last_seen`
      ).bind(name, canonical, occurrences.get(name) ?? 0, now)
    );
  }
  if (statements.length > 0) await env.DB.batch(statements);

  for (const [itemId, normalized] of normalizedTagsByItem) {
    const canonicals = unionTopics(
      normalized.map((name) => resolvedByName.get(name) ?? name),
      [],
      MAX_TAGS_PER_ITEM
    );
    canonicalTagsByItem.set(itemId, canonicals);
  }
  return canonicalTagsByItem;
}

export interface RankedTopic {
  topic: string;
  count: number;
}

/** Pure aggregation: counts topic occurrences across a set of items' tag
 * lists and returns the top `limit`, most-frequent first. */
export function rankTopics(tagLists: string[][], limit: number): RankedTopic[] {
  const counts = new Map<string, number>();
  for (const tags of tagLists) {
    for (const tag of tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Thin executor: ranks topics by frequency among published items in the
 * last `sinceSec`-second window (epoch seconds, same convention as
 * items.published_at). Reads straight off `items.tags` — already
 * rewritten to canonical form by `normalizeTopics` — rather than trying
 * to derive a time-windowed ranking from the all-time cumulative
 * `topics.count`, which only tracks frequency, not recency of use.
 */
export async function topRankedTopics(
  db: D1Database,
  opts: { sinceSec: number; limit: number }
): Promise<RankedTopic[]> {
  const { results } = await db
    .prepare(
      "SELECT tags FROM items WHERE status = 'published' AND published_at >= ?"
    )
    .bind(opts.sinceSec)
    .all<{ tags: string }>();

  const tagLists: string[][] = [];
  for (const row of results ?? []) {
    try {
      const parsed = JSON.parse(row.tags);
      if (Array.isArray(parsed)) tagLists.push(parsed);
    } catch {
      // skip malformed tags JSON
    }
  }
  return rankTopics(tagLists, opts.limit);
}
