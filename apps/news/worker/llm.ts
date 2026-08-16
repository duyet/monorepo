import type { Env } from "./types.js";

const BATCH_SIZE = 15;
// Generous ceiling: some anyrouter-routed models (e.g. reasoning models
// like stepfun-ai/step-3.7-flash) spend a large chunk of the token budget
// on hidden `message.reasoning` before ever emitting `message.content`. A
// low max_tokens starves the actual answer entirely.
const MAX_TOKENS = 8192;
const CATEGORIES = [
  "Models",
  "Regulation",
  "Products",
  "Agents",
  "Research",
  "Industry",
  "Legal",
  "Infra",
  "Releases",
  "Chips",
  "Funding",
] as const;

interface ChatMessage {
  role: "system" | "user";
  content: string;
}

async function callAnyrouter(
  env: Env,
  messages: ChatMessage[],
  opts: { json?: boolean } = {}
): Promise<string> {
  const baseUrl = env.ANYROUTER_BASE_URL || "https://anyrouter.dev/api/v1";
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.ANYROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: env.ANYROUTER_MODEL,
      messages,
      temperature: 0,
      max_tokens: MAX_TOKENS,
      ...(opts.json ? { response_format: { type: "json_object" } } : {}),
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    throw new Error(
      `anyrouter request failed: ${res.status} ${await res.text()}`
    );
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string; reasoning?: string } }[];
  };
  const message = data.choices?.[0]?.message;
  const content = message?.content;
  if (content?.trim()) return content;

  // Reasoning-model fallback: content came back empty, but the model may
  // have produced the JSON answer inside its `reasoning` field (e.g. right
  // before running out of budget, or because it never separated the two).
  if (message?.reasoning) {
    const extracted = extractLastJsonObject(message.reasoning);
    if (extracted) return extracted;
  }

  throw new Error("anyrouter response missing content");
}

/**
 * Scans backward from the last `}` to find its matching `{` by brace-depth
 * counting, returning the last complete top-level JSON object in `text`.
 * Used to salvage a JSON answer that a reasoning model tacked onto the end
 * of its `message.reasoning` instead of `message.content`.
 */
function extractLastJsonObject(text: string): string | null {
  const end = text.lastIndexOf("}");
  if (end === -1) return null;
  let depth = 0;
  for (let i = end; i >= 0; i--) {
    if (text[i] === "}") depth++;
    else if (text[i] === "{") {
      depth--;
      if (depth === 0) return text.slice(i, end + 1);
    }
  }
  return null;
}

/**
 * Strips ```json fences and parses. If there's no fence, some models still
 * wrap the JSON in prose ("Here's the result: {...}") despite json mode;
 * fall back to extracting the outermost {...} or [...] block. Throws if
 * nothing parseable is found.
 */
function parseJson<T>(raw: string): T {
  let text = raw.trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) {
    text = fenced[1].trim();
  } else {
    const start = text.search(/[[{]/);
    const end = Math.max(text.lastIndexOf("}"), text.lastIndexOf("]"));
    if (start >= 0 && end > start) {
      text = text.slice(start, end + 1);
    }
  }
  return JSON.parse(text) as T;
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export interface ScoreInput {
  i: number;
  title: string;
  summary?: string;
  source: string;
}

export interface ScoreResult {
  i: number;
  relevance: number;
  importance: number;
  quality: number;
  category: string;
  tags: string[];
}

export async function scoreItems(
  env: Env,
  items: ScoreInput[]
): Promise<ScoreResult[]> {
  const results: ScoreResult[] = [];

  for (const batch of chunk(items, BATCH_SIZE)) {
    const prompt = `You are scoring AI/tech news items for relevance and importance.
For each item, return relevance (0-1, is this genuinely AI/tech news), importance (0-10), quality (0-10, writing/source quality), category (one of: ${CATEGORIES.join(", ")}), and tags (array of short keyword strings).

Items:
${JSON.stringify(batch.map(({ i, title, summary, source }) => ({ i, title, summary, source })))}

Respond with strict JSON only: {"results":[{"i":0,"relevance":0.9,"importance":7,"quality":8,"category":"Models","tags":["..."]}]}`;

    try {
      const raw = await callAnyrouter(
        env,
        [{ role: "user", content: prompt }],
        { json: true }
      );
      const parsed = parseJson<{ results: ScoreResult[] }>(raw);
      if (Array.isArray(parsed.results)) {
        results.push(...parsed.results);
      }
    } catch (error) {
      console.error("scoreItems batch failed:", error);
    }
  }

  return results;
}

export interface TranslateInput {
  i: number;
  title: string;
  summary?: string;
}

export interface TranslateResult {
  i: number;
  title: string;
  summary: string;
}

export async function translateItems(
  env: Env,
  items: TranslateInput[]
): Promise<TranslateResult[]> {
  const results: TranslateResult[] = [];

  for (const batch of chunk(items, BATCH_SIZE)) {
    const prompt = `Translate the following news items from English to Vietnamese. Keep proper nouns (model/company names) unchanged.

Items:
${JSON.stringify(batch.map(({ i, title, summary }) => ({ i, title, summary })))}

Respond with strict JSON only: {"results":[{"i":0,"title":"...","summary":"..."}]}`;

    try {
      const raw = await callAnyrouter(
        env,
        [{ role: "user", content: prompt }],
        { json: true }
      );
      const parsed = parseJson<{ results: TranslateResult[] }>(raw);
      if (Array.isArray(parsed.results)) {
        results.push(...parsed.results);
      }
    } catch (error) {
      console.error("translateItems batch failed:", error);
    }
  }

  return results;
}

export interface TldrItem {
  id: string;
  title: string;
  summary?: string;
}

export interface TldrBullet {
  text: string;
  item_id: string;
}

export interface TldrResult {
  bullets_en: TldrBullet[];
  bullets_vi: TldrBullet[];
}

const EMPTY_TLDR: TldrResult = { bullets_en: [], bullets_vi: [] };

function normalizeBullets(input: unknown): TldrBullet[] {
  if (!Array.isArray(input)) return [];
  const out: TldrBullet[] = [];
  for (const entry of input) {
    if (typeof entry === "string" && entry.trim()) {
      out.push({ text: entry, item_id: "" });
      continue;
    }
    if (entry && typeof entry === "object") {
      const e = entry as Record<string, unknown>;
      const text = typeof e.text === "string" ? e.text : undefined;
      if (!text) continue;
      const itemId =
        typeof e.item_id === "string"
          ? e.item_id
          : typeof e.id === "string"
            ? e.id
            : "";
      out.push({ text, item_id: itemId });
    }
  }
  return out;
}

/** Accepts the documented `{bullets_en, bullets_vi}` shape as well as a
 * `{bullets: {en, vi}}` alternate the model sometimes returns, and tolerates
 * bullets that are plain strings or missing `item_id`. */
function normalizeTldrResult(parsed: unknown): TldrResult {
  if (!parsed || typeof parsed !== "object") return EMPTY_TLDR;
  const p = parsed as Record<string, unknown>;
  const nested =
    p.bullets && typeof p.bullets === "object"
      ? (p.bullets as Record<string, unknown>)
      : null;

  return {
    bullets_en: normalizeBullets(p.bullets_en ?? nested?.en),
    bullets_vi: normalizeBullets(p.bullets_vi ?? nested?.vi),
  };
}

export async function generateTldr(
  env: Env,
  items: TldrItem[]
): Promise<TldrResult> {
  const prompt = `Summarize the following AI/tech news items into roughly 12 concise TL;DR bullets, in both English and Vietnamese. Each bullet must reference the item_id it was derived from.

Items:
${JSON.stringify(items)}

Respond with strict JSON only: {"bullets_en":[{"text":"...","item_id":"..."}],"bullets_vi":[{"text":"...","item_id":"..."}]}`;

  const ATTEMPTS = 2;
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      const raw = await callAnyrouter(
        env,
        [{ role: "user", content: prompt }],
        { json: true }
      );
      const result = normalizeTldrResult(parseJson<unknown>(raw));
      if (result.bullets_en.length > 0 || result.bullets_vi.length > 0) {
        return result;
      }
      console.error(
        `generateTldr attempt ${attempt}/${ATTEMPTS} returned no bullets`
      );
    } catch (error) {
      console.error(
        `generateTldr attempt ${attempt}/${ATTEMPTS} failed:`,
        error
      );
    }
  }

  return EMPTY_TLDR;
}

export {
  extractLastJsonObject as _extractLastJsonObjectForTests,
  normalizeTldrResult as _normalizeTldrForTests,
  parseJson as _parseJsonForTests,
};
