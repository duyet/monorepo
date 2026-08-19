/** Minimal markdown → email HTML. Escape first, then restore a small
 *  allowlist of inline/block marks. Links must be http(s). */

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeHref(raw: string): string | null {
  const href = raw.trim();
  if (!/^https?:\/\//i.test(href)) return null;
  try {
    const url = new URL(href);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

function inline(text: string): string {
  let html = escapeHtml(text);
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_match, label: string, href: string) => {
      const safe = safeHref(href.replace(/&amp;/g, "&"));
      if (!safe) return label;
      return `<a href="${escapeHtml(safe)}" style="color:#0a0a0a;text-decoration:underline">${label}</a>`;
    }
  );
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>");
  html = html.replace(
    /`([^`]+)`/g,
    '<code style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;background:#f5f5f5;padding:1px 4px;border-radius:4px">$1</code>'
  );
  return html;
}

function isBullet(line: string): boolean {
  return /^[-*]\s+/.test(line);
}

function isOrdered(line: string): boolean {
  return /^\d+\.\s+/.test(line);
}

function headingLevel(line: string): number {
  const match = /^(#{1,3})\s+(.+)$/.exec(line);
  return match ? match[1].length : 0;
}

const HEADING_STYLE: Record<number, string> = {
  1: "margin:0 0 16px;font-size:24px;line-height:1.25;font-weight:500;letter-spacing:-0.02em;color:#0a0a0a",
  2: "margin:24px 0 12px;font-size:18px;line-height:1.3;font-weight:500;letter-spacing:-0.01em;color:#0a0a0a",
  3: "margin:20px 0 8px;font-size:16px;line-height:1.35;font-weight:500;color:#0a0a0a",
};

function listHtml(lines: string[], ordered: boolean): string {
  const tag = ordered ? "ol" : "ul";
  const items = lines
    .map((line) =>
      ordered ? line.replace(/^\d+\.\s+/, "") : line.replace(/^[-*]\s+/, "")
    )
    .map((item) => `<li style="margin:0 0 8px;padding:0">${inline(item)}</li>`)
    .join("");
  return `<${tag} style="margin:0 0 20px;padding:0 0 0 22px;color:#0a0a0a;font-size:16px;line-height:1.65">${items}</${tag}>`;
}

/** Turns campaign markdown into table-safe email HTML fragments. */
export function markdownToEmailHtml(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "") {
      i++;
      continue;
    }
    const level = headingLevel(line);
    if (level) {
      const text = line.replace(/^#{1,3}\s+/, "");
      const tag = `h${level}` as "h1" | "h2" | "h3";
      blocks.push(
        `<${tag} style="${HEADING_STYLE[level]}">${inline(text)}</${tag}>`
      );
      i++;
      continue;
    }
    if (isBullet(line) || isOrdered(line)) {
      const ordered = isOrdered(line);
      const group: string[] = [];
      while (
        i < lines.length &&
        (ordered ? isOrdered(lines[i]) : isBullet(lines[i]))
      ) {
        group.push(lines[i]);
        i++;
      }
      blocks.push(listHtml(group, ordered));
      continue;
    }
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !headingLevel(lines[i]) &&
      !isBullet(lines[i]) &&
      !isOrdered(lines[i])
    ) {
      para.push(lines[i]);
      i++;
    }
    blocks.push(
      `<p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:#0a0a0a">${inline(para.join(" "))}</p>`
    );
  }
  return blocks.join("\n");
}

export function markdownToPlainText(md: string): string {
  return md
    .replace(/\r\n/g, "\n")
    .replace(/^#{1,3}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
    .replace(/^[-*]\s+/gm, "• ")
    .replace(/^\d+\.\s+/gm, (match) => match)
    .trim();
}
