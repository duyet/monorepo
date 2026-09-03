export const SUBMISSION_KIND_LIST = ["contact", "jd", "comment"] as const;
export type SubmissionKind = (typeof SUBMISSION_KIND_LIST)[number];

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

export type JdPayload = { company?: string; note?: string } & (
  | { text: string }
  | { url: string }
);

export interface CommentPayload {
  post: string;
  author: string;
  email?: string;
  body: string;
}

interface Payloads {
  contact: ContactPayload;
  jd: JdPayload;
  comment: CommentPayload;
}

export type PayloadOf<K extends SubmissionKind> = Payloads[K];

export type ParseError = { ok: false; status: 400 | 404 };
export type ParseResult<T> = { ok: true; value: T } | ParseError;
export type BodyResult =
  | { ok: true; raw: Record<string, unknown> }
  | { ok: false; status: 400 | 413 | 415 };

export interface SubmissionRow {
  id: string;
  kind: SubmissionKind;
  payload_json: string;
  ip_hash: string;
  created_at: number;
  status: "pending";
}

export interface Accepted {
  id: string;
  status: "pending";
}

export interface ParseContext {
  knownPostSlugs: ReadonlySet<string>;
}

export interface EmailContent {
  subject: string;
  text: string;
}

export interface KindSpec<P> {
  readonly path: string;
  readonly maxBodyBytes: number;
  readonly parse: (
    raw: Record<string, unknown>,
    ctx: ParseContext
  ) => ParseResult<P>;
  readonly email: (id: string, payload: P) => EmailContent;
}

export const SUBMISSION_RATE_LIMIT = { max: 5, windowMs: 10 * 60_000 } as const;

export const ERROR_BODY: Record<
  400 | 404 | 413 | 415 | 429 | 503,
  { error: string }
> = {
  400: { error: "Bad Request" },
  404: { error: "Not Found" },
  413: { error: "Payload Too Large" },
  415: { error: "Unsupported Media Type" },
  429: { error: "Too Many Requests" },
  503: { error: "Service Unavailable" },
};

export type NotifyOutcome = "sent" | "skipped" | "failed";
export type SubmissionOutcome =
  | "accepted"
  | "honeypot"
  | "rate_limited"
  | `rejected:${400 | 404 | 413 | 415}`
  | "store_unavailable"
  | "posts_unavailable"
  | `notify:${NotifyOutcome}`;

const HONEYPOT_FIELD = "website";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;
const encoder = new TextEncoder();

const BAD_REQUEST: ParseError = { ok: false, status: 400 };
const NOT_FOUND: ParseError = { ok: false, status: 404 };

function byteLength(text: string): number {
  return encoder.encode(text).length;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(
  raw: Record<string, unknown>,
  allowed: readonly string[]
): boolean {
  return Object.keys(raw).every(
    (key) => key === HONEYPOT_FIELD || allowed.includes(key)
  );
}

function requiredString(
  raw: Record<string, unknown>,
  key: string,
  maxLength: number
): string | null {
  const value = raw[key];
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length < 1 || trimmed.length > maxLength) return null;
  return trimmed;
}

type Optional<T> = { ok: true; value: T | undefined } | { ok: false };

function optionalString(
  raw: Record<string, unknown>,
  key: string,
  maxLength: number
): Optional<string> {
  if (!(key in raw)) return { ok: true, value: undefined };
  const value = raw[key];
  if (typeof value !== "string") return { ok: false };
  const trimmed = value.trim();
  if (trimmed.length > maxLength) return { ok: false };
  return { ok: true, value: trimmed === "" ? undefined : trimmed };
}

function isEmail(value: string): boolean {
  return value.length <= MAX_EMAIL_LENGTH && EMAIL_PATTERN.test(value);
}

function isHttpsUrl(value: string): boolean {
  if (value.length > 2048) return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizePostSlug(post: string): string {
  const withSlash = post.startsWith("/") ? post : `/${post}`;
  return withSlash.endsWith(".html") ? withSlash.slice(0, -5) : withSlash;
}

export function parseContact(
  raw: Record<string, unknown>
): ParseResult<ContactPayload> {
  if (!hasOnlyKeys(raw, ["name", "email", "message"])) return BAD_REQUEST;
  const name = requiredString(raw, "name", 200);
  const email = requiredString(raw, "email", MAX_EMAIL_LENGTH);
  const message = requiredString(raw, "message", 8000);
  if (name === null || email === null || message === null) return BAD_REQUEST;
  if (!isEmail(email)) return BAD_REQUEST;
  return { ok: true, value: { name, email, message } };
}

export function parseJd(raw: Record<string, unknown>): ParseResult<JdPayload> {
  if (!hasOnlyKeys(raw, ["company", "note", "text", "url"])) return BAD_REQUEST;
  const company = optionalString(raw, "company", 200);
  const note = optionalString(raw, "note", 2000);
  if (!company.ok || !note.ok) return BAD_REQUEST;
  const hasText = "text" in raw;
  const hasUrl = "url" in raw;
  if (hasText === hasUrl) return BAD_REQUEST;

  const meta = {
    ...(company.value === undefined ? {} : { company: company.value }),
    ...(note.value === undefined ? {} : { note: note.value }),
  };

  if (hasText) {
    const text = raw.text;
    if (typeof text !== "string") return BAD_REQUEST;
    const trimmed = text.trim();
    const bytes = byteLength(trimmed);
    if (bytes < 1 || bytes > 32_768) return BAD_REQUEST;
    return { ok: true, value: { ...meta, text: trimmed } };
  }

  const url = requiredString(raw, "url", 2048);
  if (url === null || !isHttpsUrl(url)) return BAD_REQUEST;
  return { ok: true, value: { ...meta, url } };
}

export function parseComment(
  raw: Record<string, unknown>,
  ctx: ParseContext
): ParseResult<CommentPayload> {
  if (!hasOnlyKeys(raw, ["post", "author", "email", "body"])) {
    return BAD_REQUEST;
  }
  const rawPost = requiredString(raw, "post", 2048);
  const author = requiredString(raw, "author", 100);
  const body = requiredString(raw, "body", 4000);
  const email = optionalString(raw, "email", MAX_EMAIL_LENGTH);
  if (rawPost === null || author === null || body === null || !email.ok) {
    return BAD_REQUEST;
  }
  if (email.value !== undefined && !isEmail(email.value)) return BAD_REQUEST;

  const post = normalizePostSlug(rawPost);
  if (!ctx.knownPostSlugs.has(post)) return NOT_FOUND;

  return {
    ok: true,
    value: {
      post,
      author,
      ...(email.value === undefined ? {} : { email: email.value }),
      body,
    },
  };
}

function subject(kind: SubmissionKind, id: string): string {
  return `[${kind}] submission ${id}`;
}

export const SUBMISSION_KINDS: {
  readonly [K in SubmissionKind]: KindSpec<PayloadOf<K>>;
} = {
  contact: {
    path: "/api/contact",
    maxBodyBytes: 8_192,
    parse: parseContact,
    email: (id, payload) => ({
      subject: subject("contact", id),
      text: `From: ${payload.name} <${payload.email}>\n\n${payload.message}`,
    }),
  },
  jd: {
    path: "/api/jd",
    maxBodyBytes: 40_960,
    parse: parseJd,
    email: (id, payload) => ({
      subject: subject("jd", id),
      text: [
        `Company: ${payload.company ?? "-"}`,
        `Note: ${payload.note ?? "-"}`,
        "",
        "text" in payload ? payload.text : payload.url,
      ].join("\n"),
    }),
  },
  comment: {
    path: "/api/comments",
    maxBodyBytes: 8_192,
    parse: parseComment,
    email: (id, payload) => ({
      subject: subject("comment", id),
      text: [
        `Post: ${payload.post}`,
        `Author: ${payload.author} <${payload.email ?? "-"}>`,
        "",
        payload.body,
      ].join("\n"),
    }),
  },
};

function mediaType(contentType: string | null): string {
  return (contentType ?? "").split(";")[0].trim().toLowerCase();
}

export async function readJsonBody(
  request: Request,
  maxBytes: number
): Promise<BodyResult> {
  if (mediaType(request.headers.get("Content-Type")) !== "application/json") {
    return { ok: false, status: 415 };
  }
  const declared = Number(request.headers.get("Content-Length"));
  if (Number.isFinite(declared) && declared > maxBytes) {
    return { ok: false, status: 413 };
  }
  const text = await request.text();
  if (byteLength(text) > maxBytes) return { ok: false, status: 413 };

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, status: 400 };
  }
  if (!isRecord(parsed)) return { ok: false, status: 400 };
  return { ok: true, raw: parsed };
}

export function isHoneypotTripped(raw: Record<string, unknown>): boolean {
  const value = raw[HONEYPOT_FIELD];
  return typeof value === "string" && value.trim() !== "";
}

export async function hashIp(ip: string, salt?: string): Promise<string> {
  const input = salt ? `${salt}:${ip}` : ip;
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(input));
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

export function toRow(
  kind: SubmissionKind,
  payload: PayloadOf<SubmissionKind>,
  ipHash: string,
  now: number
): SubmissionRow {
  return {
    id: crypto.randomUUID(),
    kind,
    payload_json: JSON.stringify(payload),
    ip_hash: ipHash,
    created_at: now,
    status: "pending",
  };
}

const INSERT_SQL =
  "INSERT INTO submissions (id, kind, payload_json, ip_hash, created_at, status) VALUES (?1, ?2, ?3, ?4, ?5, ?6)";

export async function insertSubmission(
  db: D1Database,
  row: SubmissionRow
): Promise<void> {
  await db
    .prepare(INSERT_SQL)
    .bind(
      row.id,
      row.kind,
      row.payload_json,
      row.ip_hash,
      row.created_at,
      row.status
    )
    .run();
}

export async function notify(
  email: SendEmail | undefined,
  content: EmailContent
): Promise<NotifyOutcome> {
  if (!email) return "skipped";
  try {
    await email.send({
      from: { email: "api@duyet.net", name: "duyet.net API" },
      to: "me@duyet.net",
      subject: content.subject,
      text: content.text,
    });
    return "sent";
  } catch {
    return "failed";
  }
}

export function logOutcome(
  kind: SubmissionKind,
  outcome: SubmissionOutcome,
  id?: string
): void {
  console.info(`submission kind=${kind} outcome=${outcome} id=${id ?? "-"}`);
}
