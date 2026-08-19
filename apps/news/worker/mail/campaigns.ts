import type { Env } from "../types.js";
import { wrapWithAi, type ContentPick, type WrapResult } from "./compose.js";
import {
  listUnsubscribeHeaders,
  NOTES_FROM,
  renderNoteEmail,
  unsubscribeUrl,
} from "./render.js";
import { ensureMailSchema } from "./schema.js";
import { BUILTIN_TEMPLATES, templateById } from "./templates.js";

export interface HandlerError {
  error: string;
  status?: number;
}

export function isMailError(value: unknown): value is HandlerError {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof (value as { error: unknown }).error === "string"
  );
}

export interface CampaignRow {
  id: string;
  template_id: string | null;
  subject: string;
  preheader: string;
  body_md: string;
  cta_label: string;
  cta_url: string;
  status: string;
  created_at: number;
  updated_at: number;
  sent_at: number | null;
  sent_count: number;
  failed_count: number;
}

export interface SubscriberListRow {
  email: string;
  lang: string;
  timezone: string | null;
  created_at: number | null;
  source: string | null;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export async function listTemplates(env: Env) {
  await ensureMailSchema(env.DB);
  const { results } = await env.DB.prepare(
    "SELECT * FROM email_templates ORDER BY name"
  ).all<EmailTemplateRow>();
  const custom = results ?? [];
  const customIds = new Set(custom.map((row) => row.id));
  const builtin = BUILTIN_TEMPLATES.filter((t) => !customIds.has(t.id));
  return { templates: [...builtin, ...custom] };
}

interface EmailTemplateRow {
  id: string;
  name: string;
  description: string;
  subject: string;
  preheader: string;
  body_md: string;
  cta_label: string;
  cta_url: string;
}

export async function upsertTemplate(
  env: Env,
  id: string,
  input: Record<string, unknown>
): Promise<{ ok: true; id: string } | HandlerError> {
  if (!id) return { error: "id is required", status: 400 };
  await ensureMailSchema(env.DB);
  const now = Date.now();
  const builtin = templateById(id);
  const name = asString(input.name, builtin?.name ?? id);
  await env.DB.prepare(
    `INSERT INTO email_templates
       (id, name, description, subject, preheader, body_md, cta_label, cta_url, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name,
       description = excluded.description,
       subject = excluded.subject,
       preheader = excluded.preheader,
       body_md = excluded.body_md,
       cta_label = excluded.cta_label,
       cta_url = excluded.cta_url,
       updated_at = excluded.updated_at`
  )
    .bind(
      id,
      name,
      asString(input.description, builtin?.description ?? ""),
      asString(input.subject, builtin?.subject ?? ""),
      asString(input.preheader, builtin?.preheader ?? ""),
      asString(input.body_md, builtin?.body_md ?? ""),
      asString(input.cta_label, builtin?.cta_label ?? ""),
      asString(input.cta_url, builtin?.cta_url ?? ""),
      now,
      now
    )
    .run();
  return { ok: true, id };
}

export async function listSubscribers(env: Env) {
  await ensureMailSchema(env.DB);
  const { results } = await env.DB.prepare(
    `SELECT s.email, s.lang, s.timezone, s.created_at, src.source
     FROM subscribers s
     LEFT JOIN subscriber_sources src ON src.email = s.email
     WHERE s.confirmed = 1
     ORDER BY s.created_at DESC`
  ).all<SubscriberListRow>();
  return { subscribers: results ?? [], count: results?.length ?? 0 };
}

export async function listCampaigns(env: Env) {
  await ensureMailSchema(env.DB);
  const { results } = await env.DB.prepare(
    "SELECT * FROM email_campaigns ORDER BY created_at DESC LIMIT 50"
  ).all<CampaignRow>();
  return { campaigns: results ?? [] };
}

export async function getCampaign(
  env: Env,
  id: string
): Promise<CampaignRow | HandlerError> {
  await ensureMailSchema(env.DB);
  const row = await env.DB.prepare("SELECT * FROM email_campaigns WHERE id = ?")
    .bind(id)
    .first<CampaignRow>();
  if (!row) return { error: "campaign not found", status: 404 };
  return row;
}

export interface SaveCampaignInput {
  id?: string;
  template_id?: string;
  subject?: string;
  preheader?: string;
  body_md?: string;
  cta_label?: string;
  cta_url?: string;
}

export async function saveCampaign(
  env: Env,
  input: SaveCampaignInput
): Promise<CampaignRow | HandlerError> {
  await ensureMailSchema(env.DB);
  const now = Date.now();
  const id = asString(input.id) || crypto.randomUUID();
  const existing = await env.DB.prepare(
    "SELECT * FROM email_campaigns WHERE id = ?"
  )
    .bind(id)
    .first<CampaignRow>();
  if (existing?.status === "sent") {
    return { error: "cannot edit a sent campaign", status: 400 };
  }
  const template = templateById(asString(input.template_id, "note"));
  const subject = asString(input.subject, existing?.subject ?? "");
  const body_md = asString(input.body_md, existing?.body_md ?? "");
  if (!subject.trim()) return { error: "subject is required", status: 400 };
  if (!body_md.trim()) return { error: "body is required", status: 400 };

  await env.DB.prepare(
    `INSERT INTO email_campaigns
       (id, template_id, subject, preheader, body_md, cta_label, cta_url, status, created_at, updated_at, sent_count, failed_count)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, 0, 0)
     ON CONFLICT(id) DO UPDATE SET
       template_id = excluded.template_id,
       subject = excluded.subject,
       preheader = excluded.preheader,
       body_md = excluded.body_md,
       cta_label = excluded.cta_label,
       cta_url = excluded.cta_url,
       updated_at = excluded.updated_at`
  )
    .bind(
      id,
      asString(
        input.template_id,
        existing?.template_id ?? template?.id ?? "note"
      ),
      subject.trim(),
      asString(input.preheader, existing?.preheader ?? ""),
      body_md,
      asString(input.cta_label, existing?.cta_label ?? ""),
      asString(input.cta_url, existing?.cta_url ?? ""),
      existing?.created_at ?? now,
      now
    )
    .run();

  const row = await env.DB.prepare("SELECT * FROM email_campaigns WHERE id = ?")
    .bind(id)
    .first<CampaignRow>();
  if (!row) return { error: "failed to save campaign", status: 500 };
  return row;
}

export function previewCampaign(
  campaign: Pick<
    CampaignRow,
    "subject" | "preheader" | "body_md" | "cta_label" | "cta_url"
  >,
  token = "preview"
) {
  const cta =
    campaign.cta_label && campaign.cta_url
      ? { label: campaign.cta_label, url: campaign.cta_url }
      : undefined;
  return renderNoteEmail({
    subject: campaign.subject,
    preheader: campaign.preheader,
    bodyMd: campaign.body_md,
    cta,
    unsubscribeUrl: unsubscribeUrl(token),
  });
}

export async function wrapCampaign(
  env: Env,
  input: {
    templateId?: unknown;
    source?: unknown;
    picks?: unknown;
    campaignId?: unknown;
  }
): Promise<(WrapResult & { campaign?: CampaignRow }) | HandlerError> {
  const source = asString(input.source);
  const templateId = asString(input.templateId, "note") || "note";
  const picks = Array.isArray(input.picks)
    ? (input.picks as ContentPick[]).filter(
        (p) => p && typeof p.title === "string"
      )
    : [];
  if (!source.trim() && picks.length === 0) {
    return { error: "source or picks required", status: 400 };
  }
  const wrapped = await wrapWithAi(env, {
    templateId,
    source,
    picks,
  });
  const campaignId = asString(input.campaignId);
  if (!campaignId) return wrapped;
  const saved = await saveCampaign(env, {
    id: campaignId,
    template_id: templateId,
    ...wrapped,
  });
  if (isMailError(saved)) return saved;
  return { ...wrapped, campaign: saved };
}

export async function sendCampaign(
  env: Env,
  id: string,
  opts: { testEmail?: string } = {}
): Promise<
  { ok: true; sent: number; failed: number; test?: boolean } | HandlerError
> {
  await ensureMailSchema(env.DB);
  if (!env.EMAIL) {
    return { error: "EMAIL binding not configured", status: 503 };
  }
  const campaign = await getCampaign(env, id);
  if (isMailError(campaign)) return campaign;
  if (!campaign.subject.trim() || !campaign.body_md.trim()) {
    return { error: "campaign is empty", status: 400 };
  }

  const testEmail = opts.testEmail?.trim();
  if (testEmail) {
    const sub = await env.DB.prepare(
      "SELECT email, unsubscribe_token FROM subscribers WHERE email = ? AND confirmed = 1"
    )
      .bind(testEmail)
      .first<{ email: string; unsubscribe_token: string }>();
    const token = sub?.unsubscribe_token ?? "preview";
    const rendered = previewCampaign(campaign, token);
    try {
      await env.EMAIL.send({
        to: testEmail,
        from: NOTES_FROM,
        subject: `[test] ${campaign.subject}`,
        html: rendered.html,
        text: rendered.text,
        headers: listUnsubscribeHeaders(token),
      });
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
        status: 502,
      };
    }
    return { ok: true, sent: 1, failed: 0, test: true };
  }

  const { results: subscribers } = await env.DB.prepare(
    "SELECT email, unsubscribe_token FROM subscribers WHERE confirmed = 1"
  ).all<{ email: string; unsubscribe_token: string }>();
  if (!subscribers || subscribers.length === 0) {
    return { error: "no subscribers", status: 400 };
  }

  let sent = 0;
  let failed = 0;
  for (const sub of subscribers) {
    const rendered = previewCampaign(campaign, sub.unsubscribe_token);
    try {
      await env.EMAIL.send({
        to: sub.email,
        from: NOTES_FROM,
        subject: campaign.subject,
        html: rendered.html,
        text: rendered.text,
        headers: listUnsubscribeHeaders(sub.unsubscribe_token),
      });
      await env.DB.prepare(
        `INSERT INTO email_sends (campaign_id, email, sent_at, error)
         VALUES (?, ?, ?, NULL)
         ON CONFLICT(campaign_id, email) DO UPDATE SET sent_at = excluded.sent_at, error = NULL`
      )
        .bind(id, sub.email, Date.now())
        .run();
      sent++;
    } catch (error) {
      failed++;
      await env.DB.prepare(
        `INSERT INTO email_sends (campaign_id, email, sent_at, error)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(campaign_id, email) DO UPDATE SET error = excluded.error`
      )
        .bind(
          id,
          sub.email,
          Date.now(),
          error instanceof Error ? error.message : String(error)
        )
        .run();
    }
  }

  await env.DB.prepare(
    `UPDATE email_campaigns
     SET status = 'sent', sent_at = ?, sent_count = ?, failed_count = ?, updated_at = ?
     WHERE id = ?`
  )
    .bind(Date.now(), sent, failed, Date.now(), id)
    .run();

  return { ok: true, sent, failed };
}
