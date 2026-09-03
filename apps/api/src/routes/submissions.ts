import { type Context, Hono } from "hono";
import type { Env } from "../env.js";
import { getPostSlugs } from "../lib/blog-posts.js";
import { consumeRateLimit, secondsUntil } from "../lib/rate-limit.js";
import {
  type Accepted,
  ERROR_BODY,
  hashIp,
  insertSubmission,
  isHoneypotTripped,
  logOutcome,
  notify,
  type ParseContext,
  readJsonBody,
  SUBMISSION_KIND_LIST,
  SUBMISSION_KINDS,
  SUBMISSION_RATE_LIMIT,
  type SubmissionKind,
  toRow,
} from "../lib/submissions.js";
import { clientIp } from "./card-description-streaming.js";

type SubmissionContext = Context<{ Bindings: Env }>;

const NO_POSTS: ParseContext = { knownPostSlugs: new Set() };

function accepted(c: SubmissionContext, body: Accepted): Response {
  return c.json(body, 202);
}

function handler<K extends SubmissionKind>(kind: K) {
  const spec = SUBMISSION_KINDS[kind];

  return async (c: SubmissionContext): Promise<Response> => {
    const ip = clientIp(c.req.raw);
    const now = Date.now();
    const limit = consumeRateLimit(
      `submit:${kind}:${ip}`,
      now,
      SUBMISSION_RATE_LIMIT.max,
      SUBMISSION_RATE_LIMIT.windowMs
    );
    c.header("RateLimit-Limit", String(SUBMISSION_RATE_LIMIT.max));
    c.header("RateLimit-Remaining", String(limit.remaining));
    c.header("RateLimit-Reset", String(secondsUntil(limit.resetAt, now)));
    if (!limit.allowed) {
      c.header("Retry-After", String(secondsUntil(limit.resetAt, now)));
      logOutcome(kind, "rate_limited");
      return c.json(ERROR_BODY[429], 429);
    }

    const body = await readJsonBody(c.req.raw, spec.maxBodyBytes);
    if (!body.ok) {
      logOutcome(kind, `rejected:${body.status}`);
      return c.json(ERROR_BODY[body.status], body.status);
    }

    if (isHoneypotTripped(body.raw)) {
      logOutcome(kind, "honeypot");
      return accepted(c, { id: crypto.randomUUID(), status: "pending" });
    }

    let ctx = NO_POSTS;
    if (kind === "comment") {
      try {
        ctx = { knownPostSlugs: await getPostSlugs() };
      } catch {
        logOutcome(kind, "posts_unavailable");
        return c.json(ERROR_BODY[503], 503);
      }
    }

    const parsed = spec.parse(body.raw, ctx);
    if (!parsed.ok) {
      logOutcome(kind, `rejected:${parsed.status}`);
      return c.json(ERROR_BODY[parsed.status], parsed.status);
    }

    const db = c.env.SUBMISSIONS_DB;
    if (!db) {
      logOutcome(kind, "store_unavailable");
      return c.json(ERROR_BODY[503], 503);
    }

    const row = toRow(
      kind,
      parsed.value,
      await hashIp(ip, c.env.SUBMISSIONS_IP_SALT),
      now
    );
    await insertSubmission(db, row);

    const notified = notify(
      c.env.NOTIFY_EMAIL,
      spec.email(row.id, parsed.value)
    ).then((outcome) => logOutcome(kind, `notify:${outcome}`, row.id));
    c.executionCtx.waitUntil(notified);

    logOutcome(kind, "accepted", row.id);
    return accepted(c, { id: row.id, status: "pending" });
  };
}

const submissionsRouter = new Hono<{ Bindings: Env }>();

for (const kind of SUBMISSION_KIND_LIST) {
  submissionsRouter.post(SUBMISSION_KINDS[kind].path, handler(kind));
}

export default submissionsRouter;
