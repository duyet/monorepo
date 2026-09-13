/** Canonical duyet.net logo files. Prefer these URLs everywhere. */
export const DUYET_BRAND_BASE = "https://duyet.net/brand";

export type DuyetLogoTone =
  | "auto"
  | "light"
  | "dark"
  | "on-light"
  | "on-dark"
  | "canonical";

export type DuyetLogoFormat = "svg" | "png";
export type DuyetLogoPngSize = 64 | 512;

type StaticTone = Exclude<DuyetLogoTone, "auto">;

const SVG: Record<StaticTone, string> = {
  canonical: "logo.svg",
  light: "logo-light.svg",
  dark: "logo-dark.svg",
  "on-light": "logo-on-light.svg",
  "on-dark": "logo-on-dark.svg",
};

const PNG: Record<StaticTone, { 64: string; 512: string; full: string }> = {
  canonical: {
    64: "logo-64.png",
    512: "logo-512.png",
    full: "logo.png",
  },
  light: {
    64: "logo-light-64.png",
    512: "logo-light-512.png",
    full: "logo-light-512.png",
  },
  dark: {
    64: "logo-dark-64.png",
    512: "logo-dark-512.png",
    full: "logo-dark-512.png",
  },
  "on-light": {
    64: "logo-on-light-64.png",
    512: "logo-on-light-512.png",
    full: "logo-on-light-512.png",
  },
  "on-dark": {
    64: "logo-on-dark-64.png",
    512: "logo-on-dark-512.png",
    full: "logo-on-dark-512.png",
  },
};

export const DUYET_FAVICON_SVG = `${DUYET_BRAND_BASE}/logo.svg`;
export const DUYET_FAVICON_APPLE = `${DUYET_BRAND_BASE}/logo-512.png`;

/** TanStack Start / document `head.links` favicon entries. */
export function duyetFaviconHeadLinks(): Array<{
  rel: string;
  href: string;
  type?: string;
}> {
  return [
    { rel: "icon", href: DUYET_FAVICON_SVG, type: "image/svg+xml" },
    { rel: "apple-touch-icon", href: DUYET_FAVICON_APPLE },
  ];
}

export function duyetLogoUrl(options?: {
  tone?: StaticTone;
  format?: DuyetLogoFormat;
  pngSize?: DuyetLogoPngSize | "full";
}): string {
  const tone = options?.tone ?? "canonical";
  const format = options?.format ?? "svg";
  const file =
    format === "png"
      ? PNG[tone][options?.pngSize === "full" ? "full" : (options?.pngSize ?? 64)]
      : SVG[tone];
  return `${DUYET_BRAND_BASE}/${file}`;
}

export const DUYET_LOGO_VARIANTS: Array<{
  tone: StaticTone;
  label: string;
  note: string;
  previewBg: "light" | "dark";
}> = [
  {
    tone: "canonical",
    label: "Canonical",
    note: "White mark on a dark tile.",
    previewBg: "light",
  },
  {
    tone: "light",
    label: "Light UI",
    note: "Black mark, transparent.",
    previewBg: "light",
  },
  {
    tone: "dark",
    label: "Dark UI",
    note: "White mark, transparent.",
    previewBg: "dark",
  },
  {
    tone: "on-light",
    label: "On light",
    note: "Tiled mark for light surfaces.",
    previewBg: "light",
  },
  {
    tone: "on-dark",
    label: "On dark",
    note: "Tiled mark for dark surfaces.",
    previewBg: "dark",
  },
];

export const DUYET_LOGO_ASSETS: Array<{
  tone: StaticTone;
  format: DuyetLogoFormat;
  pngSize?: DuyetLogoPngSize | "full";
  desc: string;
}> = [
  { tone: "canonical", format: "svg", desc: "Canonical square — white D on dark tile" },
  { tone: "canonical", format: "png", pngSize: "full", desc: "Canonical PNG" },
  { tone: "canonical", format: "png", pngSize: 64, desc: "Canonical 64×64" },
  { tone: "canonical", format: "png", pngSize: 512, desc: "Canonical 512×512" },
  { tone: "light", format: "svg", desc: "Black mark, transparent" },
  { tone: "light", format: "png", pngSize: 64, desc: "Light mark 64×64" },
  { tone: "light", format: "png", pngSize: 512, desc: "Light mark 512×512" },
  { tone: "dark", format: "svg", desc: "White mark, transparent" },
  { tone: "dark", format: "png", pngSize: 64, desc: "Dark mark 64×64" },
  { tone: "dark", format: "png", pngSize: 512, desc: "Dark mark 512×512" },
  { tone: "on-light", format: "svg", desc: "Tiled on light" },
  { tone: "on-light", format: "png", pngSize: 64, desc: "On light 64×64" },
  { tone: "on-light", format: "png", pngSize: 512, desc: "On light 512×512" },
  { tone: "on-dark", format: "svg", desc: "Tiled on dark" },
  { tone: "on-dark", format: "png", pngSize: 64, desc: "On dark 64×64" },
  { tone: "on-dark", format: "png", pngSize: 512, desc: "On dark 512×512" },
];
