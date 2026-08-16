import type { Env } from "../types.js";

export interface TldrBulletLike {
  text: string;
  item_id?: string;
}

export interface SubscriberRow {
  email: string;
  lang: string;
  unsubscribe_token: string;
}

export interface TldrSnapshotRow {
  date: string;
  bullets_en: string | null;
  bullets_vi: string | null;
  sent_at: number | null;
}

const SITE_URL = "https://news.duyet.net";
const FROM_ADDRESS = "news@duyet.net";
const MAX_BULLETS = 5;

/** Parses and caps a snapshot's bullets JSON column to the top N. */
export function topBullets(
  bulletsJson: string | null,
  max = MAX_BULLETS
): TldrBulletLike[] {
  if (!bulletsJson) return [];
  try {
    const parsed = JSON.parse(bulletsJson);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, max);
  } catch {
    return [];
  }
}

/** A digest is only sendable once the snapshot has bullets and hasn't been sent yet. */
export function shouldSendDigest(
  snapshot: Pick<TldrSnapshotRow, "bullets_en" | "bullets_vi" | "sent_at">
): boolean {
  if (snapshot.sent_at) return false;
  return (
    topBullets(snapshot.bullets_en).length > 0 ||
    topBullets(snapshot.bullets_vi).length > 0
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Builds the plain-text and HTML bodies for a subscriber's daily digest email. */
export function buildDigestEmail(
  date: string,
  bullets: TldrBulletLike[],
  lang: string,
  unsubscribeToken: string
): { subject: string; html: string; text: string } {
  const unsubscribeUrl = `${SITE_URL}/subscribe?unsubscribe=${unsubscribeToken}`;
  const title = `AI News TL;DR — ${date}`;
  const footerText =
    lang === "vi"
      ? `Hủy đăng ký: ${unsubscribeUrl}`
      : `Unsubscribe: ${unsubscribeUrl}`;
  const footerHtml =
    lang === "vi"
      ? `Hủy đăng ký tại <a href="${unsubscribeUrl}">${unsubscribeUrl}</a>`
      : `Unsubscribe at <a href="${unsubscribeUrl}">${unsubscribeUrl}</a>`;

  const items = bullets.slice(0, MAX_BULLETS);
  const textLines = items.map((b, i) => `${i + 1}. ${b.text}`);
  const htmlItems = items
    .map((b) => `<li>${escapeHtml(b.text)}</li>`)
    .join("\n");

  const text = `${title}\n\n${textLines.join("\n")}\n\n${SITE_URL}\n\n${footerText}`;
  const html = `<h1>${escapeHtml(title)}</h1>
<ol>
${htmlItems}
</ol>
<p><a href="${SITE_URL}">${SITE_URL}</a></p>
<p style="color:#888;font-size:12px">${footerHtml}</p>`;

  return { subject: title, html, text };
}

/**
 * Sends today's TL;DR digest (top 5 bullets, per-subscriber language) to
 * every confirmed subscriber, then marks the snapshot as sent. No-ops if
 * the snapshot is missing/empty/already sent, or if the EMAIL binding
 * isn't configured (Email Sending not yet onboarded for the account) —
 * this must never break the hourly ingest workflow.
 */
export async function sendDailyTldr(env: Env): Promise<void> {
  if (!env.EMAIL) {
    console.error("EMAIL binding not configured; skipping daily digest");
    return;
  }

  const date = new Date().toISOString().slice(0, 10);
  const snapshot = await env.DB.prepare(
    "SELECT date, bullets_en, bullets_vi, sent_at FROM tldr_snapshots WHERE date = ?"
  )
    .bind(date)
    .first<TldrSnapshotRow>();

  if (!snapshot || !shouldSendDigest(snapshot)) return;

  const { results: subscribers } = await env.DB.prepare(
    "SELECT email, lang, unsubscribe_token FROM subscribers WHERE confirmed = 1"
  ).all<SubscriberRow>();

  if (!subscribers || subscribers.length === 0) {
    await env.DB.prepare("UPDATE tldr_snapshots SET sent_at = ? WHERE date = ?")
      .bind(Date.now(), date)
      .run();
    return;
  }

  for (const sub of subscribers) {
    const bullets = topBullets(
      sub.lang === "en" ? snapshot.bullets_en : snapshot.bullets_vi
    );
    if (bullets.length === 0) continue;

    const { subject, html, text } = buildDigestEmail(
      date,
      bullets,
      sub.lang,
      sub.unsubscribe_token
    );

    try {
      await env.EMAIL.send({
        to: sub.email,
        from: { email: FROM_ADDRESS, name: "AI News" },
        subject,
        html,
        text,
      });
    } catch (error) {
      console.error(`digest send failed for ${sub.email}:`, error);
    }
  }

  await env.DB.prepare("UPDATE tldr_snapshots SET sent_at = ? WHERE date = ?")
    .bind(Date.now(), date)
    .run();
}
