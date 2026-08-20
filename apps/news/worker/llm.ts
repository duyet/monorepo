import { looksVietnamese } from "./tldr-lang.js";
import type { Env } from "./types.js";

const BATCH_SIZE = 15;
/** 15-item translate JSON + VI_STYLE routinely times out native Gemma 4
 *  at the 90s attempt cap; 3 titles still fill a homepage row and finish. */
export const TRANSLATE_BATCH_SIZE = 3;
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

/** Vietnamese house style. Literal translation reads badly to Vietnamese tech
 * readers, who expect fluent Vietnamese prose with the English jargon left
 * alone rather than calqued. */
const VI_STYLE = `You are a Vietnamese tech journalist writing AI/tech news for Vietnamese readers.

Write natural, fluent Vietnamese, never a word-by-word translation. Rephrase freely so every sentence follows Vietnamese structure and rhythm.

Keep in English: product and model names (GPT, Claude, Qwen), company names, benchmark names, and the industry jargon Vietnamese readers already use in English — fine-tune, benchmark, agent, token, LLM, GPU, AI, swarm, multi-agent. Mixed English/Vietnamese prose is expected. Do translate terms with a settled Vietnamese equivalent, e.g. open-source becomes mã nguồn mở.

NEVER add a parenthetical English gloss after a Vietnamese word, like "bầy (swarm)" or "đa tác nhân (multi-agent)". Pick one: the English term on its own, or a natural Vietnamese word on its own — never both stapled together.

NEVER translate word-by-word (calque). Read the whole sentence, then restate the same fact the way a Vietnamese journalist would say it out loud — not the way each individual word maps across languages. Prefer active, concrete verbs over stiff noun-phrase calques (e.g. "cho thấy" / "phát hiện" / "ghi nhận", not "đã ghi nhận những lỗi phối hợp"). Split a long English sentence into two Vietnamese ones, or merge two short ones into one, whichever reads more naturally — don't preserve English sentence boundaries or punctuation just because the source used them. Avoid bureaucratic filler ("đã ghi nhận những", "tiến hành thực hiện") in favor of plain, direct phrasing.

Prefer everyday Vietnamese over stiff Sino-Vietnamese formalese when both exist and mean the same thing: "dùng" over "sử dụng" where it reads naturally, "hãng" or "công ty" over "tập đoàn" for an ordinary company, "mở" over "tiến hành mở". Formal Sino-Vietnamese isn't wrong, but reach for it only when the everyday word would sound too casual for the fact being reported.

Numbers and units follow Vietnamese press style: "2,5 tỷ USD" not "2.5 billion USD", "300 triệu người dùng" not "300 million users" — translate the unit word, keep the digits, use Vietnamese decimal comma.

Keep sentence subjects light: drop a pronoun or restated noun where Vietnamese naturally omits it across clauses (don't repeat "công ty này" every clause when context already carries it).

Headlines: punchy and information-dense like Vietnamese tech press, but never clickbait — no teaser phrasing that withholds the actual news ("điều bất ngờ", "không thể tin nổi").

Example 1 — bad (parenthetical gloss + calque + robotic rhythm):
"Các thử nghiệm trên bầy (swarm) Claude agent đã ghi nhận những lỗi phối hợp, hành vi thông đồng ngầm và phá hoại lẫn nhau."
Example 1 — good (English term kept plain, active verbs, natural flow):
"Thử nghiệm với swarm nhiều Claude agent cho thấy chúng phối hợp lỗi, ngầm bắt tay nhau và thậm chí phá hoại lẫn nhau — nghiên cứu phân tích ý nghĩa của điều này với an toàn AI."

Example 2 — bad (calqued noun phrase, bureaucratic filler):
"Công ty đã thực hiện việc ra mắt một mô hình mới với hiệu suất được cải thiện."
Example 2 — good (concrete verb, trimmed):
"Công ty vừa ra mắt mô hình mới, hiệu suất được cải thiện rõ rệt."

Example 3 — bad (over-formal Sino-Vietnamese where everyday words fit fine):
"Tập đoàn đã tiến hành sử dụng nguồn vốn đầu tư để thực hiện việc mở rộng quy mô hoạt động."
Example 3 — good (everyday words, same meaning):
"Hãng dùng vốn đầu tư để mở rộng quy mô hoạt động."

Example 4 — bad (stiff passive voice, calqued from English "was trained on"):
"Mô hình đã được huấn luyện bởi công ty trên một tập dữ liệu gồm 10 nghìn tỷ token."
Example 4 — good (active voice, natural Vietnamese press number style):
"Công ty huấn luyện mô hình trên bộ dữ liệu 10 nghìn tỷ token."

Example 5 — bad (one long stiff sentence, English clause order preserved):
"Startup này, được thành lập vào năm 2023 bởi một nhóm cựu kỹ sư của OpenAI và đã huy động được 500 triệu USD, hiện đang mở rộng sang thị trường châu Á sau khi ra mắt sản phẩm mới."
Example 5 — good (split into two, subject carried lightly):
"Startup này do một nhóm cựu kỹ sư OpenAI thành lập năm 2023, đã huy động 500 triệu USD. Sau khi ra mắt sản phẩm mới, công ty đang mở rộng sang thị trường châu Á."

Titles: concise headline style, viết hoa chữ cái đầu câu như báo chí Việt Nam, never ALL CAPS.
Summaries: complete, natural sentences.`;

interface ChatMessage {
  role: "system" | "user";
  content: string;
}

interface AnyrouterCallResult {
  content: string;
  tokens: number;
}

/** Labels a call by which pipeline stage issued it, for the `llm_calls`
 * observability log. "other" covers callers outside this file (dedupe's
 * clustering, submissions/suggestions review, translation QA) that don't
 * pass an explicit label. */
export type LlmTask =
  | "score"
  | "translate"
  | "tldr"
  | "cluster"
  | "review"
  | "mail"
  | "other";

/** One row of the `llm_calls` observability log: one entry per model
 * attempted inside callAnyrouter's fallback loop, including failed
 * attempts before a fallback succeeded. */
export interface LlmCallLogEntry {
  ts: number;
  task: LlmTask;
  model: string;
  ok: boolean;
  tokens: number;
  durationMs: number;
  error: string | null;
  promptChars: number;
  /** First 2000 chars of the raw response content. Only set on success —
   * a failed attempt has no usable content to snippet. */
  responseSnippet: string | null;
}

export type LlmCallLogger = (entry: LlmCallLogEntry) => void | Promise<void>;

let llmCallLogger: LlmCallLogger | null = null;

/** Installs (or clears, via `null`) the sink for `llm_calls` log entries.
 * Call sites never await this logger and never let it affect behavior —
 * see `logLlmCall` below. */
export function setLlmCallLogger(fn: LlmCallLogger | null): void {
  llmCallLogger = fn;
}

/** Fire-and-forget: a throwing or rejecting logger must never fail or
 * change the outcome of callAnyrouter/scoreItems/translateItems/generateTldr. */
function logLlmCall(entry: LlmCallLogEntry): void {
  if (!llmCallLogger) return;
  try {
    const result = llmCallLogger(entry);
    if (result && typeof (result as Promise<void>).then === "function") {
      (result as Promise<void>).catch((error) => {
        console.error("llm call logger rejected:", error);
      });
    }
  } catch (error) {
    console.error("llm call logger threw:", error);
  }
}

const REQUEST_TIMEOUT_MS = 120_000;

/** Anyrouter reports usage in camelCase on the streaming metadata event and in
 * snake_case on non-streaming responses. */
interface Usage {
  total_tokens?: number;
  totalTokens?: number;
  prompt_tokens?: number;
  promptTokens?: number;
  inputTokens?: number;
  completion_tokens?: number;
  completionTokens?: number;
  outputTokens?: number;
}

interface StreamEvent {
  object?: string;
  choices?: { delta?: { content?: string; reasoning?: string } }[];
  usage?: Usage;
  // The trailing metadata frame has been seen nesting usage under either key.
  metadata?: { usage?: Usage };
  anyrouter_metadata?: { usage?: Usage };
}

function countTokens(usage: Usage): number {
  const total = usage.total_tokens ?? usage.totalTokens;
  if (typeof total === "number") return total;
  const input = usage.prompt_tokens ?? usage.promptTokens ?? usage.inputTokens;
  const output =
    usage.completion_tokens ?? usage.completionTokens ?? usage.outputTokens;
  return (input ?? 0) + (output ?? 0);
}

/** Long prompts used to come back as `{"object":"chat.completion.queued",
 * "id":"req_…","choices":[],"queue_position":N}` instead of a completion, and
 * anyrouter exposes no endpoint that resolves such a request id. Streaming
 * bypasses the queue entirely, so this is only a defensive check. */
function isQueued(data: { object?: string }): boolean {
  return typeof data.object === "string" && data.object.endsWith(".queued");
}

/** `ANYROUTER_MODEL` and its per-task overrides hold either one model id or a
 * comma-separated fallback chain. */
function parseModels(spec: string | undefined): string[] {
  return (spec ?? "")
    .split(",")
    .map((model) => model.trim())
    .filter(Boolean);
}

/**
 * Streams a chat completion from one model. `stream: true` is not an
 * optimization here — it is the only request shape anyrouter answers inline
 * for large prompts.
 */
async function streamCompletion(
  env: Env,
  model: string,
  messages: ChatMessage[],
  opts: {
    json?: boolean;
    timeoutMs: number;
    signal?: AbortSignal;
    maxTokens?: number;
  }
): Promise<AnyrouterCallResult> {
  const baseUrl = env.ANYROUTER_BASE_URL || "https://anyrouter.dev/api/v1";
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.ANYROUTER_API_KEY}`,
      // Anyrouter reads both for dashboard app attribution.
      "HTTP-Referer": "https://news.duyet.net",
      "X-Title": "AI News (news.duyet.net)",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0,
      max_tokens: opts.maxTokens ?? MAX_TOKENS,
      stream: true,
      ...(opts.json ? { response_format: { type: "json_object" } } : {}),
    }),
    signal: opts.signal ?? AbortSignal.timeout(opts.timeoutMs),
  });

  if (!res.ok) {
    const body = await res.text();
    const requested = opts.maxTokens ?? MAX_TOKENS;
    const afford = /can only afford (\d+)/i.exec(body);
    const affordable = afford ? Number(afford[1]) : 0;
    if (res.status === 402 && affordable > 0 && affordable < requested) {
      return streamCompletion(env, model, messages, {
        ...opts,
        maxTokens: affordable,
      });
    }
    throw new Error(`anyrouter request failed: ${res.status} ${body}`);
  }
  if (!res.body) throw new Error("anyrouter response missing content");

  let content = "";
  let reasoning = "";
  let tokens = 0;
  let sawEvent = false;
  let queued = false;
  let rawBody = "";
  let buffer = "";
  let done = false;

  // Server-sent events arrive as `data: {…}` lines terminated by `data: [DONE]`,
  // and a single chunk can split a line in half, so lines are cut out of a
  // rolling buffer rather than per chunk.
  const consumeLine = (line: string): void => {
    if (!line.startsWith("data:")) return;
    const payload = line.slice("data:".length).trim();
    if (payload === "[DONE]") {
      done = true;
      return;
    }
    let event: StreamEvent;
    try {
      event = JSON.parse(payload) as StreamEvent;
    } catch {
      return; // keep-alives and other noise
    }
    sawEvent = true;
    if (isQueued(event)) queued = true;
    const delta = event.choices?.[0]?.delta;
    if (delta?.content) content += delta.content;
    if (delta?.reasoning) reasoning += delta.reasoning;
    const usage =
      event.usage ?? event.anyrouter_metadata?.usage ?? event.metadata?.usage;
    if (usage) tokens = countTokens(usage);
  };

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  try {
    while (!done) {
      const { value, done: finished } = await reader.read();
      if (finished) break;
      const text = decoder.decode(value, { stream: true });
      rawBody += text;
      buffer += text;
      let newline = buffer.indexOf("\n");
      while (newline !== -1 && !done) {
        consumeLine(buffer.slice(0, newline).trim());
        buffer = buffer.slice(newline + 1);
        newline = buffer.indexOf("\n");
      }
    }
    if (!done) consumeLine(buffer.trim());
  } finally {
    await reader.cancel().catch(() => {});
  }

  if (content.trim()) return { content, tokens };

  // Reasoning-model fallback: content came back empty, but the model may
  // have produced the JSON answer inside its `reasoning` field (e.g. right
  // before running out of budget, or because it never separated the two).
  if (reasoning) {
    const extracted = extractLastJsonObject(reasoning);
    if (extracted) return { content: extracted, tokens };
  }

  // A body with no events at all is not a stream — most likely a queue receipt
  // delivered as plain JSON rather than as an event.
  if (!sawEvent && rawBody.trim()) {
    try {
      queued = isQueued(JSON.parse(rawBody) as { object?: string });
    } catch {
      // not JSON either; fall through to the generic error
    }
  }
  if (queued) throw new Error("anyrouter queued a streaming request");

  throw new Error("anyrouter response missing content");
}

/** Hang-cap. 90s equaled a 90s batch budget so leftover never reached
 *  fallbacks after one native hang. 25s still finishes a 3-item title
 *  batch and leaves a 20s floor for two more ids. */
export const MODEL_SLICE_MAX_MS = 25_000;
const FALLBACK_FLOOR_MS = 20_000;

/**
 * Per-attempt budget: keep an even slice for up to two fallbacks, give the
 * rest (capped) to the current id. Fast failures therefore leave later
 * models far more than `budget / n`; a hang still cannot eat the deadline.
 */
export function modelAttemptTimeoutMs(
  remainingMs: number,
  remainingModels: number,
  maxSliceMs = MODEL_SLICE_MAX_MS
): number {
  if (remainingMs <= 0 || remainingModels <= 0) return 0;
  const even = remainingMs / remainingModels;
  const fallbacksToKeep = Math.min(remainingModels - 1, 2);
  const reserved = fallbacksToKeep * Math.min(FALLBACK_FLOOR_MS, even);
  return Math.max(1, Math.min(maxSliceMs, remainingMs - reserved));
}

/**
 * AbortSignal.timeout on fetch is not enough: a stalled SSE body read can
 * ignore the signal. Racing a timer guarantees the chain advances. Abort
 * the in-flight fetch so a hung stream does not leak subrequests into
 * the next attempt.
 */
function raceTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string,
  abort?: AbortController
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      abort?.abort();
      reject(new Error(`${label} timed out after ${Math.round(ms)}ms`));
    }, ms);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timer !== undefined) clearTimeout(timer);
  });
}

/**
 * Tries each model in the configured chain until one returns usable content.
 * Transport errors, non-200s, timeouts and empty/unusable completions all
 * advance to the next model; the last failure is rethrown if none succeed.
 */
async function callAnyrouter(
  env: Env,
  messages: ChatMessage[],
  opts: {
    json?: boolean;
    modelSpec?: string;
    task?: LlmTask;
    timeoutMs?: number;
    maxTokens?: number;
    /** A 200 with content that fails this check is a model failure so
     *  the next id in the chain can run (e.g. empty sanitize). */
    accept?: (content: string) => boolean;
  } = {}
): Promise<AnyrouterCallResult> {
  const task = opts.task ?? "other";
  const models = parseModels(opts.modelSpec || env.ANYROUTER_MODEL);
  if (models.length === 0) throw new Error("anyrouter model is not configured");

  // One budget for the whole chain, so a long chain cannot outlive the
  // workflow step that a single call was sized to fit inside. Each attempt
  // is sized by modelAttemptTimeoutMs: leftover budget after a fast fail
  // goes to the next id (not locked to budget/n), and a hang is capped so
  // two fallbacks still run. raceTimeout aborts the fetch so a stalled
  // SSE body cannot leak subrequests into the next attempt.
  const budget = opts.timeoutMs ?? REQUEST_TIMEOUT_MS;
  const deadline = Date.now() + budget;
  const failures: string[] = [];
  const promptChars = messages.reduce((sum, m) => sum + m.content.length, 0);

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    const timeoutMs = modelAttemptTimeoutMs(
      deadline - Date.now(),
      models.length - i
    );
    if (timeoutMs <= 0) {
      failures.push(`${model}: leftover budget too small`);
      continue;
    }
    const attemptStartedAt = Date.now();
    const abort = new AbortController();
    try {
      const result = await raceTimeout(
        streamCompletion(env, model, messages, {
          json: opts.json,
          timeoutMs,
          signal: abort.signal,
          maxTokens: opts.maxTokens,
        }),
        timeoutMs,
        `anyrouter model ${model}`,
        abort
      );
      if (opts.accept && !opts.accept(result.content)) {
        throw new Error("anyrouter response failed accept check");
      }
      console.log(`anyrouter completion served by ${model}`);
      logLlmCall({
        ts: attemptStartedAt,
        task,
        model,
        ok: true,
        tokens: result.tokens,
        durationMs: Date.now() - attemptStartedAt,
        error: null,
        promptChars,
        responseSnippet: result.content.slice(0, 2000),
      });
      return result;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      failures.push(`${model}: ${msg}`);
      console.error(`anyrouter model ${model} failed:`, error);
      logLlmCall({
        ts: attemptStartedAt,
        task,
        model,
        ok: false,
        tokens: 0,
        durationMs: Date.now() - attemptStartedAt,
        error: error instanceof Error ? error.message : String(error),
        promptChars,
        responseSnippet: null,
      });
    }
  }

  throw new Error(
    "anyrouter chain exhausted: " +
      (failures.join(" | ") || "no models attempted")
  );
}

/** JSON chat completion for callers outside scoring/translate/tldr. */
export async function completeJson(
  env: Env,
  messages: ChatMessage[],
  opts: {
    task?: LlmTask;
    timeoutMs?: number;
    maxTokens?: number;
  } = {}
): Promise<string> {
  const result = await callAnyrouter(env, messages, {
    json: true,
    task: opts.task ?? "other",
    timeoutMs: opts.timeoutMs,
    maxTokens: opts.maxTokens,
  });
  return result.content;
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
  /** This batch's total token usage, attributed evenly across the batch's
   * requested items (not just the ones the model actually returned). */
  tokens: number;
}

const CATEGORY_BY_LOWER = new Map<string, string>(
  CATEGORIES.map((c) => [c.toLowerCase(), c])
);

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** Canonicalize one model-emitted tag to lowercase-kebab-case; null when the
 * result is empty or unreasonably long (small models occasionally emit whole
 * sentences as a "tag"). */
export function normalizeTag(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const tag = raw
    .toLowerCase()
    .trim()
    .replace(/[_\s/]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
  return tag && tag.length <= 40 ? tag : null;
}

/**
 * Validate one score batch against what was actually asked. Small models on
 * the fallback chain get every part of this wrong in practice: numbers as
 * strings, scores out of range, categories in the wrong case or off-enum,
 * tags with spaces/underscores, hallucinated or duplicate `i`. Coerce and
 * clamp what's salvageable; drop entries whose identity (`i`) or scores are
 * unusable — a dropped entry behaves exactly like an item the model skipped.
 */
export function sanitizeScoreResults(
  raw: unknown,
  batch: ScoreInput[],
  tokensPerItem: number
): ScoreResult[] {
  if (!Array.isArray(raw)) return [];
  const validIndexes = new Set(batch.map((b) => b.i));
  const seen = new Set<number>();
  const out: ScoreResult[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const e = entry as Record<string, unknown>;
    const i = Number(e.i);
    if (!Number.isInteger(i) || !validIndexes.has(i) || seen.has(i)) continue;
    const relevance = Number(e.relevance);
    const importance = Number(e.importance);
    const quality = Number(e.quality);
    if (
      Number.isNaN(relevance) ||
      Number.isNaN(importance) ||
      Number.isNaN(quality)
    )
      continue;
    seen.add(i);
    const category =
      typeof e.category === "string"
        ? (CATEGORY_BY_LOWER.get(e.category.trim().toLowerCase()) ?? "")
        : "";
    const tags = Array.isArray(e.tags)
      ? [
          ...new Set(
            e.tags
              .map(normalizeTag)
              .filter((t): t is string => t !== null)
              .slice(0, 6)
          ),
        ]
      : [];
    out.push({
      i,
      relevance: clamp(relevance, 0, 1),
      importance: clamp(importance, 0, 10),
      quality: clamp(quality, 0, 10),
      category,
      tags,
      tokens: tokensPerItem,
    });
  }
  return out;
}

export async function scoreItems(
  env: Env,
  items: ScoreInput[]
): Promise<ScoreResult[]> {
  const results: ScoreResult[] = [];

  for (const batch of chunk(items, BATCH_SIZE)) {
    const prompt = `You are scoring AI/tech news items for relevance and importance.
For each item, return relevance (0-1, is this genuinely AI/tech news), importance (0-10), quality (0-10, writing/source quality), category (one of: ${CATEGORIES.join(", ")}), and tags — 3 to 6 topic labels per item.

Topic label rules (this feeds a dynamic topic taxonomy, so consistency matters):
- lowercase-kebab-case only, e.g. "open-source", "multi-agent" — never spaces, underscores, or camelCase.
- Mix specific entities (anthropic, openai, nvidia, qwen) with themes (multi-agent, open-source, fine-tuning, regulation).
- Always use the same canonical spelling for the same concept: singular not plural ("llm" not "llms"), one standard hyphenation not synonyms ("open-source" not "opensource" or "oss"), no near-duplicates. If a topic could be phrased multiple ways, pick the most common/obvious industry term.
- Prefer these canonical tags whenever they apply (reuse EXACTLY as written, don't invent variants):
  entities: openai, anthropic, google, meta, xai, x, microsoft, amazon, nvidia, huggingface, deepseek, mistral, alibaba, apple, claude, fable, opus, sonnet, haiku, gpt, gemini, grok, llama, qwen, codex, claude-code, cursor, composer, copilot, windsurf, elon-musk, sam-altman
  themes: llm, agent, multi-agent, harness, inference, open-source, fine-tuning, benchmark, reasoning, safety, regulation, funding, chips, gpu, infra, robotics, coding, rag, mcp
  benchmarks: swe-bench, swe-bench-pro, livecodebench, arc-agi, arc-agi-2, mmlu, aider-polyglot
  Only invent a new tag when nothing above (or an equally obvious industry term) fits.
- 3-6 tags per item — enough to be genuinely browsable/filterable, not a single catch-all tag.

Items:
${JSON.stringify(batch.map(({ i, title, summary, source }) => ({ i, title, summary, source })))}

Respond with strict JSON only: {"results":[{"i":0,"relevance":0.9,"importance":7,"quality":8,"category":"Models","tags":["anthropic","claude","multi-agent","open-source"]}]}`;

    try {
      const { content: raw, tokens } = await callAnyrouter(
        env,
        [{ role: "user", content: prompt }],
        { json: true, task: "score" }
      );
      const parsed = parseJson<{ results?: unknown } | unknown[]>(raw);
      // Some small models return the bare array instead of {results: [...]}.
      const rows = Array.isArray(parsed) ? parsed : parsed.results;
      results.push(
        ...sanitizeScoreResults(rows, batch, Math.ceil(tokens / batch.length))
      );
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
  /** This batch's total token usage, attributed evenly across the batch's
   * requested items (not just the ones the model actually returned). */
  tokens: number;
}

/** Same defense as sanitizeScoreResults, for translations: keep only entries
 * whose `i` was actually requested (once), with non-empty string title —
 * small models sometimes echo the input array, invent indexes, or return
 * nulls for fields they failed to translate. */
export function sanitizeTranslateResults(
  raw: unknown,
  batch: TranslateInput[],
  tokensPerItem: number
): TranslateResult[] {
  if (!Array.isArray(raw)) return [];
  const validIndexes = new Set(batch.map((b) => b.i));
  const seen = new Set<number>();
  const out: TranslateResult[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const e = entry as Record<string, unknown>;
    const i = Number(e.i);
    if (!Number.isInteger(i) || !validIndexes.has(i) || seen.has(i)) continue;
    const title = typeof e.title === "string" ? e.title.trim() : "";
    if (!title) continue;
    seen.add(i);
    const summary = typeof e.summary === "string" ? e.summary.trim() : "";
    out.push({ i, title, summary, tokens: tokensPerItem });
  }
  return out;
}

/** Whole translateItems call. Several 3-item batches share this so a
 *  15-item backfill cannot stack 5 × 300s. */
const TRANSLATE_TIMEOUT_MS = 240_000;
/** 25s hang-cap + two 20s floors so leftover actually reaches fallbacks. */
const TRANSLATE_BATCH_TIMEOUT_MS = 70_000;
const TRANSLATE_MAX_TOKENS = 2048;
/** HuggingNews summaries are multi-paragraph; clip so a 3-item JSON
 *  answer still fits max_tokens instead of truncating mid-object. */
const TRANSLATE_SUMMARY_MAX_CHARS = 800;

function parseTranslateRows(raw: string): unknown {
  const parsed = parseJson<{ results?: unknown } | unknown[]>(raw);
  return Array.isArray(parsed) ? parsed : parsed.results;
}

function clipSummary(summary: string | undefined): string | undefined {
  if (!summary) return summary;
  const trimmed = summary.trim();
  if (trimmed.length <= TRANSLATE_SUMMARY_MAX_CHARS) return trimmed;
  return `${trimmed.slice(0, TRANSLATE_SUMMARY_MAX_CHARS).trimEnd()}…`;
}

function translatePrompt(batch: TranslateInput[], titlesOnly: boolean): string {
  const items = batch.map(({ i, title, summary }) =>
    titlesOnly ? { i, title } : { i, title, summary: clipSummary(summary) }
  );
  return `Translate these AI/tech news items into Vietnamese.

Items:
${JSON.stringify(items)}

Respond with strict JSON only: {"results":[{"i":0,"title":"...","summary":"..."}]}`;
}

function logTranslateBatchFailed(
  reason: string,
  batch: TranslateInput[],
  titlesOnly: boolean
): void {
  console.error(
    JSON.stringify({
      event: "translateItems.batch_failed",
      reason,
      batchSize: batch.length,
      indexes: batch.map((item) => item.i),
      titlesOnly,
    })
  );
}

async function translateBatch(
  env: Env,
  batch: TranslateInput[],
  timeoutMs: number,
  titlesOnly: boolean
): Promise<TranslateResult[]> {
  const { content: raw, tokens } = await callAnyrouter(
    env,
    [
      { role: "system", content: VI_STYLE },
      { role: "user", content: translatePrompt(batch, titlesOnly) },
    ],
    {
      json: true,
      modelSpec: env.ANYROUTER_TRANSLATE_MODEL,
      task: "translate",
      timeoutMs,
      maxTokens: TRANSLATE_MAX_TOKENS,
      accept: (content) => {
        try {
          return (
            sanitizeTranslateResults(parseTranslateRows(content), batch, 0)
              .length > 0
          );
        } catch {
          return false;
        }
      },
    }
  );
  return sanitizeTranslateResults(
    parseTranslateRows(raw),
    batch,
    Math.ceil(tokens / batch.length)
  );
}

export async function translateItems(
  env: Env,
  items: TranslateInput[]
): Promise<TranslateResult[]> {
  const results: TranslateResult[] = [];
  const deadline = Date.now() + TRANSLATE_TIMEOUT_MS;
  const needLlm: TranslateInput[] = [];

  for (const item of items) {
    if (looksVietnamese(item.title)) {
      results.push({
        i: item.i,
        title: item.title.trim(),
        summary: item.summary?.trim() ?? "",
        tokens: 0,
      });
    } else {
      needLlm.push(item);
    }
  }

  const translated = new Set(results.map((row) => row.i));

  const runBatch = async (
    batch: TranslateInput[],
    titlesOnly: boolean
  ): Promise<TranslateResult[]> => {
    const remaining = deadline - Date.now();
    if (remaining <= 0) {
      logTranslateBatchFailed("translate deadline exhausted", batch, titlesOnly);
      return [];
    }
    try {
      return await translateBatch(
        env,
        batch,
        Math.min(TRANSLATE_BATCH_TIMEOUT_MS, remaining),
        titlesOnly
      );
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      logTranslateBatchFailed(reason, batch, titlesOnly);
      return [];
    }
  };

  for (const batch of chunk(needLlm, TRANSLATE_BATCH_SIZE)) {
    if (deadline - Date.now() <= 0) {
      logTranslateBatchFailed("translate deadline exhausted", batch, false);
      break;
    }

    let got = await runBatch(batch, false);
    const hasSummary = batch.some((item) => Boolean(item.summary));
    if (got.length < batch.length && hasSummary) {
      const have = new Set(got.map((row) => row.i));
      const leftover = batch.filter((item) => !have.has(item.i));
      if (leftover.length > 0) {
        got = [...got, ...(await runBatch(leftover, true))];
      }
    }
    results.push(...got);
    for (const row of got) translated.add(row.i);

    // One poisoned item in a 3-row batch used to leave every title_vi null
    // (EN badge) until backfill. Retry leftovers one at a time.
    const stillMissing = batch.filter((item) => !translated.has(item.i));
    for (const item of stillMissing) {
      if (deadline - Date.now() <= 0) break;
      const one = await runBatch([item], true);
      results.push(...one);
      for (const row of one) translated.add(row.i);
    }
  }

  return results;
}

export interface TldrItem {
  id: string;
  title: string;
  summary?: string;
  title_vi?: string;
}

export interface TldrBullet {
  text: string;
  item_ids: string[];
}

export interface TldrResult {
  bullets_en: TldrBullet[];
  bullets_vi: TldrBullet[];
  /** Total tokens burned across all attempts. Not attributed to any item;
   * logged for visibility, not currently persisted anywhere. */
  tokens: number;
  /** Last failure, when both attempts produced no usable bullets. */
  error?: string;
}

const EMPTY_TLDR: TldrResult = { bullets_en: [], bullets_vi: [], tokens: 0 };

/** Bilingual 16+16 JSON is a large generation; give the chain more than
 * the default 120s so a reasoning model that spends its first slice on
 * hidden tokens still has time to emit content (or hand off). */
const TLDR_TIMEOUT_MS = 240_000;

/** Accepts the preferred `item_ids: string[]` shape as well as the legacy
 * single `item_id` (or `id`) string, normalizing everything to an array. */
function normalizeBullets(input: unknown): TldrBullet[] {
  if (!Array.isArray(input)) return [];
  const out: TldrBullet[] = [];
  for (const entry of input) {
    if (typeof entry === "string" && entry.trim()) {
      out.push({ text: entry, item_ids: [] });
      continue;
    }
    if (entry && typeof entry === "object") {
      const e = entry as Record<string, unknown>;
      const text = typeof e.text === "string" ? e.text : undefined;
      if (!text) continue;
      let itemIds: string[];
      if (Array.isArray(e.item_ids)) {
        itemIds = e.item_ids.filter(
          (id): id is string => typeof id === "string"
        );
      } else if (typeof e.item_id === "string" && e.item_id) {
        itemIds = [e.item_id];
      } else if (typeof e.id === "string" && e.id) {
        itemIds = [e.id];
      } else {
        itemIds = [];
      }
      out.push({ text, item_ids: itemIds });
    }
  }
  return out;
}

/** Accepts the documented `{bullets_en, bullets_vi}` shape as well as a
 * `{bullets: {en, vi}}` alternate the model sometimes returns, and tolerates
 * bullets that are plain strings or missing `item_id`. Token usage is
 * tracked separately in generateTldr, not part of this shape parsing. */
function normalizeTldrResult(parsed: unknown): Omit<TldrResult, "tokens"> {
  if (!parsed || typeof parsed !== "object") {
    return { bullets_en: [], bullets_vi: [] };
  }
  const p = parsed as Record<string, unknown>;
  const nested =
    p.bullets && typeof p.bullets === "object"
      ? (p.bullets as Record<string, unknown>)
      : null;

  return {
    bullets_en: normalizeBullets(p.bullets_en ?? nested?.en ?? p.en),
    bullets_vi: normalizeBullets(p.bullets_vi ?? nested?.vi ?? p.vi),
  };
}

/** The model sometimes hallucinates or truncates `item_id`s, which used to
 * make TL;DR bullets open the wrong story. Keep only ids that exactly match
 * an input item (or uniquely prefix-match one, expanded to the full id);
 * anything else is dropped from the bullet's id list. */
export function sanitizeBulletIds(
  bullets: TldrBullet[],
  items: Pick<TldrItem, "id">[]
): TldrBullet[] {
  const ids = new Set(items.map((i) => i.id));
  const resolve = (id: string): string | null => {
    if (ids.has(id)) return id;
    const matches = items.filter((i) => i.id.startsWith(id));
    return matches.length === 1 ? matches[0].id : null;
  };
  return bullets.map((b) => ({
    ...b,
    item_ids: b.item_ids.map(resolve).filter((id): id is string => id !== null),
  }));
}

function tldrPrompt(items: TldrItem[], bilingual: boolean): string {
  const n = Math.min(16, Math.max(1, items.length));
  const langs = bilingual
    ? "in both English and Vietnamese"
    : "in English only";
  const shape = bilingual
    ? '{"bullets_en":[{"text":"...","item_ids":["..."]}],"bullets_vi":[{"text":"...","item_ids":["..."]}]}'
    : '{"bullets_en":[{"text":"...","item_ids":["..."]}],"bullets_vi":[]}';
  const viNote = bilingual
    ? `
The Vietnamese bullets are NOT a translation pass over the English ones — write them the way a Vietnamese tech journalist would independently state the same facts, following the house style above.
`
    : "";
  return `Summarize the following ${items.length} AI/tech news items into at most ${n} concise TL;DR bullets (one per distinct story), ${langs}. Each bullet must reference the item_ids (an array) it was derived from: most bullets summarize a single story, so item_ids has one id; when several items report the same story or theme, write ONE synthesizing bullet citing ALL of their ids instead of separate bullets.
${viNote}
Items:
${JSON.stringify(items)}

Respond with strict JSON only: ${shape}`;
}

export async function generateTldr(
  env: Env,
  items: TldrItem[]
): Promise<TldrResult> {
  const ATTEMPTS = 2;
  let totalTokens = 0;
  let lastError: string | undefined;
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    // First attempt: bilingual journalist restatement. Second attempt
    // drops VI so a timeout/starved-content failure still yields EN
    // bullets the digest can send (it already falls back to EN).
    const bilingual = attempt === 1;
    try {
      const { content: raw, tokens } = await callAnyrouter(
        env,
        bilingual
          ? [
              { role: "system", content: VI_STYLE },
              { role: "user", content: tldrPrompt(items, true) },
            ]
          : [{ role: "user", content: tldrPrompt(items, false) }],
        {
          json: true,
          modelSpec: env.ANYROUTER_TLDR_MODEL,
          task: "tldr",
          timeoutMs: TLDR_TIMEOUT_MS,
          // Bilingual attempt: EN-only JSON is a miss so the next model
          // can still produce bullets_vi. EN-only is accepted on retry.
          accept: (content) => {
            try {
              const parsed = normalizeTldrResult(parseJson<unknown>(content));
              return bilingual
                ? parsed.bullets_vi.length > 0
                : parsed.bullets_en.length > 0;
            } catch {
              return false;
            }
          },
        }
      );
      totalTokens += tokens;
      const result = normalizeTldrResult(parseJson<unknown>(raw));
      if (result.bullets_en.length > 0 || result.bullets_vi.length > 0) {
        return {
          bullets_en: sanitizeBulletIds(result.bullets_en, items),
          bullets_vi: sanitizeBulletIds(result.bullets_vi, items),
          tokens: totalTokens,
        };
      }
      lastError = `attempt ${attempt}/${ATTEMPTS} returned no bullets`;
      console.error(`generateTldr ${lastError}`);
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      console.error(
        `generateTldr attempt ${attempt}/${ATTEMPTS} failed:`,
        error
      );
    }
  }

  console.error(
    `generateTldr burned ${totalTokens} tokens with no result: ${lastError}`
  );
  return { ...EMPTY_TLDR, tokens: totalTokens, error: lastError };
}

export type { AnyrouterCallResult, ChatMessage };
export {
  callAnyrouter,
  extractLastJsonObject as _extractLastJsonObjectForTests,
  normalizeTldrResult as _normalizeTldrForTests,
  parseJson,
  parseJson as _parseJsonForTests,
  VI_STYLE,
};
