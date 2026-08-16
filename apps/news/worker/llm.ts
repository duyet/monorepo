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
  opts: { json?: boolean; timeoutMs: number }
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
      max_tokens: MAX_TOKENS,
      stream: true,
      ...(opts.json ? { response_format: { type: "json_object" } } : {}),
    }),
    signal: AbortSignal.timeout(opts.timeoutMs),
  });

  if (!res.ok) {
    throw new Error(
      `anyrouter request failed: ${res.status} ${await res.text()}`
    );
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

/**
 * Tries each model in the configured chain until one returns usable content.
 * Transport errors, non-200s, timeouts and empty/unusable completions all
 * advance to the next model; the last failure is rethrown if none succeed.
 */
async function callAnyrouter(
  env: Env,
  messages: ChatMessage[],
  opts: { json?: boolean; modelSpec?: string } = {}
): Promise<AnyrouterCallResult> {
  const models = parseModels(opts.modelSpec || env.ANYROUTER_MODEL);
  if (models.length === 0) throw new Error("anyrouter model is not configured");

  // One budget for the whole chain, so a long chain cannot outlive the
  // workflow step that a single call was sized to fit inside. Each model also
  // gets an equal slice of it: without that, a first model that stalls until
  // the deadline would starve the very fallbacks it should be handing off to.
  const deadline = Date.now() + REQUEST_TIMEOUT_MS;
  const slice = REQUEST_TIMEOUT_MS / models.length;
  let lastError: unknown;

  for (const model of models) {
    const timeoutMs = Math.min(deadline - Date.now(), slice);
    if (timeoutMs <= 0) break;
    try {
      const result = await streamCompletion(env, model, messages, {
        json: opts.json,
        timeoutMs,
      });
      console.log(`anyrouter completion served by ${model}`);
      return result;
    } catch (error) {
      lastError = error;
      console.error(`anyrouter model ${model} failed:`, error);
    }
  }

  throw lastError ?? new Error("anyrouter response missing content");
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
- 3-6 tags per item — enough to be genuinely browsable/filterable, not a single catch-all tag.

Items:
${JSON.stringify(batch.map(({ i, title, summary, source }) => ({ i, title, summary, source })))}

Respond with strict JSON only: {"results":[{"i":0,"relevance":0.9,"importance":7,"quality":8,"category":"Models","tags":["anthropic","claude","multi-agent","open-source"]}]}`;

    try {
      const { content: raw, tokens } = await callAnyrouter(
        env,
        [{ role: "user", content: prompt }],
        { json: true }
      );
      const parsed = parseJson<{
        results: Omit<ScoreResult, "tokens">[];
      }>(raw);
      if (Array.isArray(parsed.results)) {
        const tokensPerItem = Math.ceil(tokens / batch.length);
        for (const result of parsed.results) {
          results.push({ ...result, tokens: tokensPerItem });
        }
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
  /** This batch's total token usage, attributed evenly across the batch's
   * requested items (not just the ones the model actually returned). */
  tokens: number;
}

export async function translateItems(
  env: Env,
  items: TranslateInput[]
): Promise<TranslateResult[]> {
  const results: TranslateResult[] = [];

  for (const batch of chunk(items, BATCH_SIZE)) {
    const prompt = `Translate these AI/tech news items into Vietnamese.

Items:
${JSON.stringify(batch.map(({ i, title, summary }) => ({ i, title, summary })))}

Respond with strict JSON only: {"results":[{"i":0,"title":"...","summary":"..."}]}`;

    try {
      const { content: raw, tokens } = await callAnyrouter(
        env,
        [
          { role: "system", content: VI_STYLE },
          { role: "user", content: prompt },
        ],
        { json: true, modelSpec: env.ANYROUTER_TRANSLATE_MODEL }
      );
      const parsed = parseJson<{
        results: Omit<TranslateResult, "tokens">[];
      }>(raw);
      if (Array.isArray(parsed.results)) {
        const tokensPerItem = Math.ceil(tokens / batch.length);
        for (const result of parsed.results) {
          results.push({ ...result, tokens: tokensPerItem });
        }
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
  /** Total tokens burned across all attempts. Not attributed to any item;
   * logged for visibility, not currently persisted anywhere. */
  tokens: number;
}

const EMPTY_TLDR: TldrResult = { bullets_en: [], bullets_vi: [], tokens: 0 };

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
    bullets_en: normalizeBullets(p.bullets_en ?? nested?.en),
    bullets_vi: normalizeBullets(p.bullets_vi ?? nested?.vi),
  };
}

export async function generateTldr(
  env: Env,
  items: TldrItem[]
): Promise<TldrResult> {
  const prompt = `Summarize the following AI/tech news items into exactly 16 concise TL;DR bullets, in both English and Vietnamese. Each bullet must reference the item_id it was derived from.

The Vietnamese bullets are NOT a translation pass over the English ones — write them the way a Vietnamese tech journalist would independently state the same facts, following the house style above.

Items:
${JSON.stringify(items)}

Respond with strict JSON only: {"bullets_en":[{"text":"...","item_id":"..."}],"bullets_vi":[{"text":"...","item_id":"..."}]}`;

  const ATTEMPTS = 2;
  let totalTokens = 0;
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      const { content: raw, tokens } = await callAnyrouter(
        env,
        [
          { role: "system", content: VI_STYLE },
          { role: "user", content: prompt },
        ],
        { json: true, modelSpec: env.ANYROUTER_TLDR_MODEL }
      );
      totalTokens += tokens;
      const result = normalizeTldrResult(parseJson<unknown>(raw));
      if (result.bullets_en.length > 0 || result.bullets_vi.length > 0) {
        return { ...result, tokens: totalTokens };
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

  console.error(`generateTldr burned ${totalTokens} tokens with no result`);
  return { ...EMPTY_TLDR, tokens: totalTokens };
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
