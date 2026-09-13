/**
 * First-party referral + UTM helpers.
 * Sitewide footer/nav links stay dofollow and keep the Referer header so
 * analytics and crawlers treat them as real backlinks.
 */

export const FIRST_PARTY_HOSTS = new Set([
  "duyet.net",
  "blog.duyet.net",
  "cv.duyet.net",
  "photos.duyet.net",
  "insights.duyet.net",
  "kb.duyet.net",
  "mcp.duyet.net",
  "homelab.duyet.net",
  "html.duyet.net",
  "agents.duyet.net",
  "llm-timeline.duyet.net",
  "ai-percentage.duyet.net",
  "x-algo.duyet.net",
  "burn.duyet.net",
  "tip.duyet.net",
  "stamp.duyet.net",
  "pageview.duyet.net",
  "oma.duyet.net",
  "summa.duyet.net",
  "aidr.today",
  "anyrouter.dev",
  "chmonitor.dev",
  "templatebot.lol",
  "agentstate.app",
  "rust-tieng-viet.github.io",
]);

export interface ProjectBacklink {
  label: string;
  href: string;
}

/** Public products to cross-link from chrome (footer, blog strip). */
export const PROJECT_BACKLINKS: readonly ProjectBacklink[] = [
  { label: "AnyRouter", href: "https://anyrouter.dev" },
  { label: "ClickHouse Monitor", href: "https://chmonitor.dev" },
  { label: "AI;DR", href: "https://aidr.today" },
  { label: "Templatebot", href: "https://templatebot.lol" },
  { label: "Agent State", href: "https://agentstate.app" },
  { label: "OMA", href: "https://oma.duyet.net" },
  { label: "Summa", href: "https://summa.duyet.net" },
  { label: "ShareHTML", href: "https://html.duyet.net" },
  { label: "Knowledge base", href: "https://kb.duyet.net" },
  { label: "MCP", href: "https://mcp.duyet.net" },
  { label: "LLM Timeline", href: "https://llm-timeline.duyet.net" },
  { label: "Burn", href: "https://burn.duyet.net" },
  { label: "Agents", href: "https://agents.duyet.net" },
  { label: "Stamp", href: "https://stamp.duyet.net" },
  { label: "PageView", href: "https://pageview.duyet.net" },
  { label: "Rust Tiếng Việt", href: "https://rust-tieng-viet.github.io" },
];

export function isFirstPartyHref(href: string): boolean {
  try {
    const host = new URL(href, "https://duyet.net").host.replace(/^www\./, "");
    if (FIRST_PARTY_HOSTS.has(host)) return true;
    return host.endsWith(".duyet.net") || host === "duyet.net";
  } catch {
    return false;
  }
}

export function withReferral(
  href: string,
  opts: { source: string; campaign?: string; content?: string },
): string {
  if (!href.startsWith("http")) return href;
  const url = new URL(href);
  if (url.searchParams.has("utm_source") || url.searchParams.has("ref")) {
    return href;
  }
  url.searchParams.set("utm_source", opts.source);
  url.searchParams.set("utm_medium", "referral");
  url.searchParams.set("utm_campaign", opts.campaign ?? "backlink");
  if (opts.content) url.searchParams.set("utm_content", opts.content);
  url.searchParams.set("ref", opts.source);
  return url.toString();
}

/** First-party: dofollow, keep Referer. Third-party: new tab, no referrer leak. */
export function referralRel(href: string): string | undefined {
  if (!href.startsWith("http")) return undefined;
  return isFirstPartyHref(href) ? undefined : "noopener noreferrer";
}

export function referralTarget(href: string): string | undefined {
  if (!href.startsWith("http")) return undefined;
  return isFirstPartyHref(href) ? undefined : "_blank";
}
