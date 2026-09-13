/**
 * Add UTM tracking parameters to a URL.
 * Converts relative paths to absolute URLs using the provided host.
 * Returns relative paths unchanged if no host is provided.
 */
export function addUtmParams(
  url: string,
  campaign = "homepage",
  content?: string,
  host?: string
): string {
  const absUrl = url.startsWith("/") && host ? `https://${host}${url}` : url;
  if (absUrl.startsWith("/")) return absUrl;
  const urlObj = new URL(absUrl);
  urlObj.searchParams.set("utm_source", "home");
  urlObj.searchParams.set("utm_medium", "referral");
  urlObj.searchParams.set("utm_campaign", campaign);
  urlObj.searchParams.set("ref", "duyet.net");
  if (content) {
    urlObj.searchParams.set("utm_content", content);
  }
  return urlObj.toString();
}
