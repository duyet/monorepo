import type { Env } from "./types.js";

const BATCH_SIZE = 15;
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
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("anyrouter response missing content");
  return content;
}

/** Strips ```json fences and parses; throws on malformed JSON. */
function parseJson<T>(raw: string): T {
  let text = raw.trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) text = fenced[1].trim();
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

export interface TldrResult {
  bullets_en: { text: string; item_id: string }[];
  bullets_vi: { text: string; item_id: string }[];
}

export async function generateTldr(
  env: Env,
  items: TldrItem[]
): Promise<TldrResult> {
  const empty: TldrResult = { bullets_en: [], bullets_vi: [] };

  const prompt = `Summarize the following AI/tech news items into roughly 12 concise TL;DR bullets, in both English and Vietnamese. Each bullet must reference the item_id it was derived from.

Items:
${JSON.stringify(items)}

Respond with strict JSON only: {"bullets_en":[{"text":"...","item_id":"..."}],"bullets_vi":[{"text":"...","item_id":"..."}]}`;

  try {
    const raw = await callAnyrouter(env, [{ role: "user", content: prompt }], {
      json: true,
    });
    const parsed = parseJson<TldrResult>(raw);
    return {
      bullets_en: Array.isArray(parsed.bullets_en) ? parsed.bullets_en : [],
      bullets_vi: Array.isArray(parsed.bullets_vi) ? parsed.bullets_vi : [],
    };
  } catch (error) {
    console.error("generateTldr failed:", error);
    return empty;
  }
}

export { parseJson as _parseJsonForTests };
