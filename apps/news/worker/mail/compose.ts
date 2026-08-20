import { completeJson } from "../llm.js";
import type { Env } from "../types.js";
import { applyTemplate, templateById } from "./templates.js";

export interface ContentPick {
  title: string;
  url?: string;
  excerpt?: string;
}

export interface WrapInput {
  templateId: string;
  source: string;
  picks?: ContentPick[];
}

export interface WrapResult {
  subject: string;
  preheader: string;
  body_md: string;
  cta_label: string;
  cta_url: string;
}

const SYSTEM = `You write emails for Duyet (duyet.net, blog.duyet.net, news.duyet.net).

Voice: first-person, pragmatic engineer. Tight. No marketing, no hype, no "excited to share", no emoji, no exclamation marks unless the source used one.

The HTML email is Cursor-like: white, Inter, lots of air, one idea. Keep the body short — a few short paragraphs or a numbered list. One optional CTA.

Return JSON only:
{
  "subject": "short, specific, not clickbait",
  "preheader": "one inbox-preview sentence",
  "body_md": "markdown body. paragraphs, **bold**, lists, [links](https://...). No images.",
  "cta_label": "short button label or empty string",
  "cta_url": "https://... or empty string"
}`;

function extractJsonObject(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.startsWith("{")) return trimmed;
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);
  return null;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function parseWrapJson(raw: string): WrapResult | null {
  const json = extractJsonObject(raw);
  if (!json) return null;
  try {
    const parsed = JSON.parse(json) as Record<string, unknown>;
    const subject = asString(parsed.subject).trim();
    const body = asString(parsed.body_md);
    if (!subject || !body.trim()) return null;
    return {
      subject,
      preheader: asString(parsed.preheader).trim(),
      body_md: body,
      cta_label: asString(parsed.cta_label).trim(),
      cta_url: asString(parsed.cta_url).trim(),
    };
  } catch {
    return null;
  }
}

function fallbackWrap(input: WrapInput): WrapResult {
  const template = templateById(input.templateId) ?? templateById("note")!;
  const first = input.picks?.[0];
  const vars: Record<string, string> = {
    body: input.source.trim(),
    title: first?.title ?? "",
    excerpt: first?.excerpt ?? input.source.trim(),
    url: first?.url ?? "",
    date: new Date().toISOString().slice(0, 10),
    preheader: first?.excerpt ?? "",
  };
  const applied = applyTemplate(template, vars);
  return {
    subject: applied.subject || first?.title || "A note",
    preheader: applied.preheader,
    body_md: applied.body_md.trim() || input.source.trim(),
    cta_label: applied.cta_label,
    cta_url: applied.cta_url,
  };
}

export async function wrapWithAi(
  env: Env,
  input: WrapInput
): Promise<WrapResult> {
  const template = templateById(input.templateId) ?? templateById("note")!;
  const picks =
    input.picks && input.picks.length > 0
      ? input.picks
          .map(
            (p, i) =>
              `${i + 1}. ${p.title}${p.url ? ` — ${p.url}` : ""}${p.excerpt ? `\n   ${p.excerpt}` : ""}`
          )
          .join("\n")
      : "(none)";
  const user = `Template: ${template.id} (${template.name}). ${template.description}

Picked content:
${picks}

Source / notes:
${input.source.trim() || "(empty)"}`;

  try {
    const raw = await completeJson(
      env,
      [
        { role: "system", content: SYSTEM },
        { role: "user", content: user },
      ],
      { task: "mail", timeoutMs: 45_000, maxTokens: 2048 }
    );
    const parsed = parseWrapJson(raw);
    if (parsed) return parsed;
  } catch (error) {
    console.error("mail wrap failed:", error);
  }
  return fallbackWrap(input);
}
