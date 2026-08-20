import type { Env } from "../types.js";
import { jsonAlertAdapter, slackAlertAdapter } from "./adapters.js";
import type { AlertEvent } from "./alert.js";
import type {
  DailyDigest,
  Notifier,
  SendResult,
  StoryPayload,
} from "./types.js";

/**
 * Generic JSON/Slack webhook. `NOTIFY_WEBHOOK_URL` posts the normalized
 * AlertEvent (or Slack payload when the URL looks like Slack).
 */
function webhookKind(url: string): "slack" | "json" {
  try {
    const host = new URL(url).hostname;
    if (host === "hooks.slack.com" || host.endsWith(".hooks.slack.com")) {
      return "slack";
    }
  } catch {
    return "json";
  }
  return "json";
}

/** Stable across retries so receivers can dedupe. */
export function webhookDeliveryId(
  kind: "digest" | "story",
  key: string
): string {
  return `news:${kind}:${key}`;
}

function digestEvent(digest: DailyDigest): AlertEvent {
  return {
    severity: "info",
    source: "news.duyet.net",
    title: `AI hôm nay có gì — ${digest.date}`,
    summary: digest.bullets.map((bullet) => bullet.text).join("\n"),
    links: [
      { label: "news.duyet.net", url: "https://news.duyet.net" },
      ...digest.bullets
        .filter((bullet) => bullet.url)
        .slice(0, 3)
        .map((bullet) => ({
          label: bullet.text.slice(0, 40),
          url: bullet.url as string,
        })),
    ],
    timestamp: Date.now(),
  };
}

function storyEvent(story: StoryPayload): AlertEvent {
  return {
    severity: story.rank_score >= 30 ? "warning" : "info",
    source: "news.duyet.net",
    title: story.title,
    summary: story.summary ?? "",
    metrics: [
      { label: "rank", value: String(Math.round(story.rank_score)) },
      { label: "importance", value: String(story.llm_importance ?? "") },
      { label: "points", value: String(story.points) },
    ],
    links: [
      { label: "source", url: story.url },
      {
        label: "permalink",
        url: `https://news.duyet.net/${(story.category ?? "ai").toLowerCase()}/${story.id.slice(0, 8)}`,
      },
    ],
    timestamp: Date.now(),
  };
}

function isTimeoutError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.name === "TimeoutError" ||
    error.name === "AbortError" ||
    /timed? ?out/i.test(error.message)
  );
}

async function postWebhook(
  env: Env,
  event: AlertEvent,
  deliveryId: string
): Promise<SendResult> {
  const url = env.NOTIFY_WEBHOOK_URL?.trim() ?? "";
  if (!url) return { ok: false, error: "NOTIFY_WEBHOOK_URL missing" };
  const kind = webhookKind(url);
  const rendered =
    kind === "slack"
      ? slackAlertAdapter.render(event)
      : jsonAlertAdapter.render(event);
  // Keep AlertEvent fields top-level; add delivery_id for JSON receivers.
  // Slack incoming webhooks ignore unknown top-level keys.
  const payload =
    kind === "slack"
      ? rendered
      : { ...(rendered as AlertEvent), delivery_id: deliveryId };
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "Idempotency-Key": deliveryId,
        "X-Delivery-Id": deliveryId,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}` };
    }
    return { ok: true, messageId: deliveryId };
  } catch (error) {
    // Timeout after the receiver may have accepted the POST — do not
    // retry (at-most-once). Idempotency-Key covers receivers that support it.
    if (isTimeoutError(error)) {
      return { ok: true, messageId: `${deliveryId}:ambiguous-timeout` };
    }
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/** Persist host/origin only — Slack webhook paths carry secrets. */
export function webhookTarget(url: string | undefined): string {
  const raw = url?.trim() ?? "";
  if (!raw) return "";
  try {
    return new URL(raw).origin;
  } catch {
    return "webhook";
  }
}

export const webhookNotifier: Notifier = {
  id: "webhook",
  target: (env) => webhookTarget(env.NOTIFY_WEBHOOK_URL),
  enabled: (env) => Boolean(env.NOTIFY_WEBHOOK_URL?.trim()),
  sendDigest: (env, digest) =>
    postWebhook(
      env,
      digestEvent(digest),
      webhookDeliveryId("digest", digest.date)
    ),
  sendStory: (env, story) =>
    postWebhook(
      env,
      storyEvent(story),
      webhookDeliveryId("story", story.id)
    ),
};
