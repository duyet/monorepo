import {
  escapeHtml,
  markdownToEmailHtml,
  markdownToPlainText,
  safeHref,
} from "./markdown.js";

export const NOTES_FROM = {
  email: "notes@duyet.net",
  name: "Duyet",
} as const;

export const NEWS_FROM = {
  email: "news@duyet.net",
  name: "AI News",
} as const;

const FONT =
  'Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif';

export interface NoteEmailInput {
  subject: string;
  preheader?: string;
  bodyMd: string;
  cta?: { label: string; url: string };
  unsubscribeUrl: string;
  wordmark?: string;
}

function ctaButton(label: string, url: string): string {
  const safe = safeHref(url);
  if (!safe) return "";
  const href = escapeHtml(safe);
  const text = escapeHtml(label);
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 28px">
  <tr>
    <td style="border-radius:8px;background:#0a0a0a">
      <a href="${href}" style="display:inline-block;padding:10px 16px;font-family:${FONT};font-size:14px;line-height:1.2;font-weight:500;color:#ffffff;text-decoration:none;border-radius:8px">${text}</a>
    </td>
  </tr>
</table>`;
}

/**
 * Cursor-like note: one 520px column, Inter, near-black on white, 8px
 * radius CTA, hairline footer. Table-based for Gmail/Outlook.
 */
export function renderNoteEmail(input: NoteEmailInput): {
  html: string;
  text: string;
} {
  const wordmark = escapeHtml(input.wordmark ?? "Duyet");
  const preheader = escapeHtml((input.preheader ?? "").trim());
  const body = markdownToEmailHtml(input.bodyMd);
  const cta =
    input.cta?.label && input.cta.url
      ? ctaButton(input.cta.label, input.cta.url)
      : "";
  const unsub = escapeHtml(input.unsubscribeUrl);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(input.subject)}</title>
</head>
<body style="margin:0;padding:0;background:#ffffff">
${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${preheader}</div>` : ""}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff">
  <tr>
    <td align="center" style="padding:32px 16px">
      <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="width:100%;max-width:520px;font-family:${FONT};color:#0a0a0a">
        <tr>
          <td style="padding:16px 8px 28px;font-size:13px;letter-spacing:0.04em;font-weight:500;color:#0a0a0a">${wordmark}</td>
        </tr>
        <tr>
          <td style="padding:0 8px 8px">
            ${body}
            ${cta}
          </td>
        </tr>
        <tr>
          <td style="padding:24px 8px 8px;border-top:1px solid #eeeeee;font-size:12px;line-height:1.5;color:#a3a3a3">
            You are receiving this because you subscribed at duyet.net.
            <a href="${unsub}" style="color:#737373;text-decoration:underline">Unsubscribe</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  const textParts = [
    markdownToPlainText(input.bodyMd),
    input.cta?.label && input.cta.url
      ? `${input.cta.label}: ${input.cta.url}`
      : "",
    `Unsubscribe: ${input.unsubscribeUrl}`,
  ].filter(Boolean);

  return { html, text: textParts.join("\n\n") };
}

export function unsubscribeUrl(token: string): string {
  return `https://news.duyet.net/subscribe?unsubscribe=${encodeURIComponent(token)}`;
}

export function oneClickUnsubscribeUrl(token: string): string {
  return `https://news.duyet.net/api/subscribe?token=${encodeURIComponent(token)}`;
}

export function listUnsubscribeHeaders(token: string): Record<string, string> {
  const click = oneClickUnsubscribeUrl(token);
  const page = unsubscribeUrl(token);
  return {
    "List-Unsubscribe": `<${click}>, <${page}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}
