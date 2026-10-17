export const SITE_TITLE = "duyetbot";
/**
 * Shared by the `<meta name="description">`, the OG/Twitter tags and the
 * committed `public/og.png` card, so the card and the meta tags cannot drift —
 * the same arrangement `apps/tip/src/lib/site.ts` uses.
 */
export const SITE_DESCRIPTION =
  "Personal AI assistant for Duyet. Auto-driven and auto-designed by the duyetbot agent.";
/** Custom domain bound in `wrangler.toml` via `[[routes]] custom_domain`. */
export const SITE_URL = "https://agent-assistant.duyet.net";
