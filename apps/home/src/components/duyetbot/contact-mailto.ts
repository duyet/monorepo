/** Public inbox from packages/profile — kept as a literal so callers stay URL-safe. */
export const CONTACT_EMAIL = "me@duyet.net";

export function contactMailto(message: string): string {
  const body = encodeURIComponent(message.trim());
  const subject = encodeURIComponent("Note from duyet.net");
  return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}
