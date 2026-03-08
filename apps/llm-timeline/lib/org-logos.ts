/**
 * Logo sources:
 * - simple-icons CDN: https://cdn.simpleicons.org/{slug}/{hex}
 *   CC0 licensed, 3,400+ brand icons (excludes OpenAI, Microsoft, Amazon, IBM — trademark removed)
 * - @lobehub/icons-static-svg CDN: https://unpkg.com/@lobehub/icons-static-svg@latest/icons/{slug}.svg
 *   767+ AI-specific provider icons, covers orgs missing from simple-icons
 */

type LogoSource = "simpleicons" | "lobehub";

interface OrgLogo {
  source: LogoSource;
  /** slug for CDN path */
  slug: string;
  /** hex color for simple-icons (without #); used for dark-mode luminance check */
  hex?: string;
}

/**
 * Maps org name → logo config.
 * simple-icons takes priority for mainstream brands; lobehub for AI-specific ones.
 */
export const ORG_LOGOS: Record<string, OrgLogo> = {
  // --- simple-icons (confirmed in v16.9.0) ---
  Anthropic: { source: "simpleicons", slug: "anthropic", hex: "191919" },
  Google: { source: "simpleicons", slug: "google", hex: "4285F4" },
  "Google DeepMind": { source: "simpleicons", slug: "deepmind", hex: "4285F4" },
  DeepMind: { source: "simpleicons", slug: "deepmind", hex: "4285F4" },
  Meta: { source: "simpleicons", slug: "meta", hex: "0467DF" },
  "Meta AI": { source: "simpleicons", slug: "meta", hex: "0467DF" },
  "Mistral AI": { source: "simpleicons", slug: "mistralai", hex: "FA520F" },
  Mistral: { source: "simpleicons", slug: "mistralai", hex: "FA520F" },
  Alibaba: { source: "simpleicons", slug: "alibabadotcom", hex: "FF6A00" },
  "Hugging Face": { source: "simpleicons", slug: "huggingface", hex: "FFD21E" },
  Apple: { source: "simpleicons", slug: "apple", hex: "000000" },
  Baidu: { source: "simpleicons", slug: "baidu", hex: "2932E1" },
  ByteDance: { source: "simpleicons", slug: "bytedance", hex: "3C8CFF" },
  Nvidia: { source: "simpleicons", slug: "nvidia", hex: "76B900" },
  MiniMax: { source: "simpleicons", slug: "minimax", hex: "E73562" },
  Salesforce: { source: "simpleicons", slug: "salesforce", hex: "00A1E0" },
  Tencent: { source: "simpleicons", slug: "tencent", hex: "1DB954" },
  // --- @lobehub/icons-static-svg (AI-specific, covers trademark-removed brands) ---
  OpenAI: { source: "lobehub", slug: "openai" },
  Microsoft: { source: "lobehub", slug: "microsoft" },
  xAI: { source: "lobehub", slug: "xai" },
  "DeepSeek-AI": { source: "lobehub", slug: "deepseek" },
  Cohere: { source: "lobehub", slug: "cohere" },
  Amazon: { source: "lobehub", slug: "aws" },
  IBM: { source: "lobehub", slug: "ibm" },
  "Stability AI": { source: "lobehub", slug: "stability" },
  Qwen: { source: "lobehub", slug: "qwen" },
  "Zhipu AI": { source: "lobehub", slug: "zhipu" },
  "Moonshot AI": { source: "lobehub", slug: "kimi" },
  Yi: { source: "lobehub", slug: "yi" },
  "01-ai": { source: "lobehub", slug: "yi" },
  "Allen AI": { source: "lobehub", slug: "ai2" },
  AllenAI: { source: "lobehub", slug: "ai2" },
  TII: { source: "lobehub", slug: "tii" },
  Falcon: { source: "lobehub", slug: "tii" },
  Inception: { source: "lobehub", slug: "inception" },
  "Liquid AI": { source: "lobehub", slug: "liquid" },
};

const LOBEHUB_CDN = "https://unpkg.com/@lobehub/icons-static-svg@latest/icons";
const SIMPLEICONS_CDN = "https://cdn.simpleicons.org";

/**
 * Returns the logo URL for an org, or null if no mapping exists.
 * `darkMode` switches simple-icons to a light color for dark-logo brands.
 */
export function getOrgLogoUrl(org: string, darkMode = false): string | null {
  const logo = ORG_LOGOS[org];
  if (!logo) return null;

  if (logo.source === "lobehub") {
    return `${LOBEHUB_CDN}/${logo.slug}.svg`;
  }

  // simple-icons: pass hex for color; in dark mode, invert dark logos to white
  const hex = logo.hex ?? "888888";
  const color = darkMode && isPerceivedDark(hex) ? "ffffff" : hex;
  return `${SIMPLEICONS_CDN}/${logo.slug}/${color}`;
}

/**
 * Returns true if the hex color is perceived as dark (luminance < 128).
 * Used to decide whether to invert the icon color in dark mode.
 * Formula: ITU-R BT.601 perceived luminance.
 */
export function isPerceivedDark(hex: string): boolean {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

/**
 * Get initials from an org name for fallback avatar.
 * e.g., "OpenAI" → "OA", "Google DeepMind" → "GD"
 */
export function getOrgInitials(org: string): string {
  return org
    .split(/[\s\-_]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Generate a consistent background color for an org based on its name.
 */
export function getOrgColor(org: string): string {
  const colors = [
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
    "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  ];
  let hash = 0;
  for (const ch of org) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffffff;
  return colors[Math.abs(hash) % colors.length];
}
