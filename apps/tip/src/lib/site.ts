export const SITE_TITLE = "Tip";
/**
 * Shared by the `<meta name="description">`, the OG/Twitter tags and the
 * committed `public/og.png` card, so the card and the meta tags cannot drift.
 * Two sentences rather than one: `cardToSvg` anchors its accent hairline to
 * the meta line's slot, and a single-line description leaves the rule sitting
 * on the descenders.
 */
export const SITE_DESCRIPTION =
  "Support duyet — buy me a coffee on Ko-fi. A small tip keeps everything up and running.";
export const SITE_URL = "https://tip.duyet.net";

/** Ko-fi embed parameters kept verbatim from the official embed snippet. */
export const KOFI_URL =
  "https://ko-fi.com/duyet/?hidefeed=true&widget=true&embed=true&preview=true";
export const KOFI_PROFILE_URL = "https://ko-fi.com/duyet";
