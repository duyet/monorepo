/**
 * Ordered-dither OG card renderer.
 *
 * Renders a 1200×630 PNG card where an optional source image becomes a
 * full-bleed ordered-dither background, with the page title/description set on
 * a solid paper panel so text stays legible.
 *
 * Uses the same 4×4 Bayer matrix as `@duyet/dither-kit` (`dither-paint.ts`) so
 * cards match the dither aesthetic used elsewhere in the monorepo.
 *
 * Deterministic by design: the same inputs always produce byte-identical PNGs,
 * which is what lets us commit generated cards to `public/og/` and reference
 * them from prerendered HTML.
 */

import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";

/** 4×4 Bayer matrix normalized to 0–1 thresholds. Mirrors dither-kit. */
export const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
].map((row) => row.map((v) => (v + 0.5) / 16));

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

export type DitherMode = "mono" | "duotone" | "invert";

export type DitherStyle = {
  /** CSS-px per dither cell. 3 = fine, 6 = chunky, 10 = blocky. */
  cell: number;
  mode: DitherMode;
  /** >1 keeps more cells lit, for a lighter/airier texture. */
  gamma?: number;
  /** Lifts the Bayer threshold, thinning the dither. */
  bias?: number;
};

export type CardTheme = {
  paper: string;
  ink: string;
  muted: string;
  accent: string;
  /** Display font family for the title. */
  displayFont: string;
  /** Mono font family for eyebrow/meta. */
  monoFont: string;
  sansFont: string;
};

export const LIGHT_THEME: CardTheme = {
  paper: "#ffffff",
  ink: "#0c0c0c",
  muted: "#54534f",
  accent: "#d8602f",
  displayFont: "Libertinus Serif, Noto Serif, Georgia, serif",
  monoFont: "Geist Mono, ui-monospace, Menlo, monospace",
  sansFont: "Geist, -apple-system, Segoe UI, sans-serif",
};

export const DARK_THEME: CardTheme = {
  paper: "#0a0a0a",
  ink: "#f4f3f1",
  muted: "#a7a6a1",
  accent: "#f0743f",
  displayFont: "Libertinus Serif, Noto Serif, Georgia, serif",
  monoFont: "Geist Mono, ui-monospace, Menlo, monospace",
  sansFont: "Geist, -apple-system, Segoe UI, sans-serif",
};

export const DEFAULT_STYLE: DitherStyle = { cell: 6, mode: "mono" };

export type CardInput = {
  title: string;
  /** Small mono line above the title, e.g. "AI · AI Harness Engineering". */
  eyebrow?: string;
  description?: string;
  /** Bottom row, e.g. "Sep 26, 2026 · 5 min read". */
  meta?: string;
  siteName?: string;
  /**
   * Source image to dither. Accepts a local file path, a Buffer, or a remote
   * URL. When absent the card renders as a pure type card (the fallback).
   */
  image?: string | Buffer;
};

export type RenderCardOptions = {
  style?: Partial<DitherStyle>;
  theme?: Partial<CardTheme>;
  /** Width of the solid type panel, as a fraction. Default 0.62. */
  panelWidth?: number;
  /** Explicit width/height when `image` is a raster we can read. */
  imageWidth?: number;
  imageHeight?: number;
  logoSvg?: string;
};

const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

const esc = (s: string): string => s.replace(/[&<>"']/g, (c) => ESCAPES[c]);

/** Trim to a rough character budget so a runaway title can't blow the layout. */
function clamp(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1).trimEnd()}…`;
}

/** Rec. 709 luma, normalized to 0..1. */
function lumaAt(px: Buffer, offset: number): number {
  return (
    (0.2126 * px[offset] + 0.7152 * px[offset + 1] + 0.0722 * px[offset + 2]) /
    255
  );
}

/**
 * Ordered-dither an image buffer into a standalone SVG using an embedded
 * low-resolution pixel matrix.
 *
 * We deliberately emit the dither as SVG rects rather than rasterizing through
 * sharp: it keeps the output resolution-independent, human-inspectable, and
 * deterministic across platforms (no libvips version skew).
 */
async function ditherToSvg(
  imageBuffer: Buffer,
  style: DitherStyle,
  theme: CardTheme,
  width: number,
  height: number
): Promise<string> {
  const sharp = (await import("sharp")).default;

  const { cell, mode, gamma = 1, bias = 0 } = style;
  const cols = Math.max(1, Math.ceil(width / cell));
  const rows = Math.max(1, Math.ceil(height / cell));

  // Sample the source on the dither lattice. cover-fit: fill the frame, center-crop overflow.
  const raw = await sharp(imageBuffer)
    .resize(cols, rows, { fit: "cover", position: "centre" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const px = raw.data;
  const w = raw.info.width;
  const h = raw.info.height;

  // Group lit cells into horizontal runs so the SVG stays small: a full-bleed
  // 6px dither is ~200x105 = 21k cells, which collapses to a few hundred rects.
  const runs: Array<[number, number, number]> = [];
  for (let y = 0; y < h; y++) {
    let runStart = -1;
    // `x <= w` walks one past the last column so a run flushes at row end.
    for (let x = 0; x <= w; x++) {
      const lit =
        x < w &&
        Math.min(1, Math.max(0, lumaAt(px, (y * w + x) * 3))) ** gamma >
          BAYER_4X4[y & 3][x & 3] + bias;
      if (lit && runStart === -1) runStart = x;
      if (!lit && runStart !== -1) {
        runs.push([runStart, y, x - runStart]);
        runStart = -1;
      }
    }
  }

  // Above this luma a cell keeps the paper-colored ink instead of flipping to
  // the accent, so light highlights read as holes rather than blobs.
  const accentCutoff = mode === "invert" ? 0.78 : 0.72;

  const colorFor = (y: number, x: number): string => {
    if (mode === "duotone" || mode === "invert") {
      return lumaAt(px, (y * w + x) * 3) > accentCutoff
        ? theme.ink
        : theme.accent;
    }
    return theme.ink;
  };

  const rects = runs
    .map(([rx, ry, rw]) => {
      const fill = colorFor(ry, rx);
      return `<rect x="${rx * cell}" y="${ry * cell}" width="${rw * cell}" height="${cell}" fill="${fill}"/>`;
    })
    .join("");

  const ground = mode === "invert" ? theme.ink : theme.paper;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="${width}" height="${height}" fill="${ground}"/>
<g>${rects}</g>
</svg>`;
}

/**
 * Serif advance-width ratios, per character, measured against the display font.
 * Serif faces are not monospaced: lowercase is narrow, capitals and `m`/`w` are
 * wide. A flat 0.5 ratio badly under-measures a title like "Autonomous Claude
 * Code Migrate…" and lets it overflow the panel, which is exactly the bug this
 * table exists to prevent.
 */
const SERIF_RATIO: Record<string, number> = {
  " ": 0.26,
  i: 0.28,
  j: 0.3,
  l: 0.3,
  I: 0.34,
  t: 0.34,
  f: 0.36,
  r: 0.38,
  ".": 0.28,
  ",": 0.28,
  "'": 0.22,
  "’": 0.22,
  ":": 0.3,
  ";": 0.3,
  m: 0.86,
  w: 0.74,
  M: 0.9,
  W: 0.88,
  "-": 0.36,
  "—": 0.9,
  "/": 0.4,
  "(": 0.36,
  ")": 0.36,
};

const DEFAULT_SERIF_RATIO = 0.52;

/** Estimated rendered width of `text` in px, for the serif display face. */
function serifWidth(text: string, fontSize: number): number {
  let w = 0;
  for (const ch of text) w += SERIF_RATIO[ch] ?? DEFAULT_SERIF_RATIO;
  return w * fontSize;
}

/** Estimated rendered width of `text` in px, for the sans face (used for desc). */
function sansWidth(text: string, fontSize: number): number {
  let w = 0;
  for (const ch of text) {
    if ("iljt.,'’".includes(ch)) w += 0.3;
    else if ("mwMW".includes(ch)) w += 0.82;
    else if (ch === " ") w += 0.27;
    else w += 0.52;
  }
  return w * fontSize;
}

/**
 * Greedy word wrap to a pixel width budget, then shrink the font until the
 * text fits in at most `maxLines`. Returns the lines plus the font size that
 * actually fit, so the caller never has to do a second pass.
 */
function fitText(
  text: string,
  maxWidth: number,
  startSize: number,
  maxLines: number,
  measure: (t: string, size: number) => number
): { lines: string[]; size: number } {
  let size = startSize;
  let best: { lines: string[]; size: number } | undefined;

  for (let attempt = 0; attempt < 40; attempt++) {
    // Wrap, and hard-break any single word that is still too wide for the
    // panel — a long token like "MWMWMWMWMWMW" has no space to wrap on, so
    // without this it would overflow forever no matter how far we shrink.
    const lines: string[] = [];
    let line = "";
    for (const word of text.split(/\s+/).filter(Boolean)) {
      let piece = word;
      // break an over-wide unbreakable token
      while (measure(piece, size) > maxWidth && piece.length > 1) {
        let cut = piece.length;
        while (cut > 1 && measure(piece.slice(0, cut), size) > maxWidth) cut--;
        if (line) {
          lines.push(line);
          line = "";
        }
        lines.push(piece.slice(0, cut));
        piece = piece.slice(cut);
      }
      const candidate = line ? `${line} ${piece}` : piece;
      if (line && measure(candidate, size) > maxWidth) {
        lines.push(line);
        line = piece;
      } else {
        line = candidate;
      }
    }
    if (line) lines.push(line);

    // Accept only when the line count fits AND nothing overflows the panel.
    const fitsWidth = lines.every((l) => measure(l, size) <= maxWidth);
    if (lines.length <= maxLines && fitsWidth) {
      return { lines, size };
    }
    // Remember the least-bad attempt so we degrade gracefully at the floor.
    if (!best || lines.length < best.lines.length) best = { lines, size };
    size -= lines.length > maxLines ? 2 : 3;
    if (size < 20) break;
  }

  // Floor reached: hard-truncate rather than let anything overflow.
  return best && best.lines.length <= maxLines
    ? best
    : { lines: [clamp(text, 32)], size: 20 };
}

/**
 * Render a 1200×630 OG card to an SVG string.
 *
 * Pure: no filesystem access, so it is trivially testable. `image` is a Buffer
 * or undefined — resolve remote/local sources with `loadCardImage` first.
 */
export function cardToSvg(
  input: CardInput,
  options: RenderCardOptions = {},
  ditherSvg?: string
): string {
  const theme = { ...LIGHT_THEME, ...options.theme };
  const { panelWidth = 0.62, logoSvg } = options;

  const pad = OG_WIDTH * 0.055;
  const panelW = OG_WIDTH * panelWidth;

  const title = clamp(input.title, 120);
  const description = input.description ? clamp(input.description, 200) : "";

  const titleMaxWidth = panelW - pad * 2;
  const descSize = 25;

  // Fit the title to the panel. A 1-line title gets full size, a 4-line title
  // shrinks; either way it cannot overflow into the dither.
  const titleFit = fitText(title, titleMaxWidth, 70, 4, serifWidth);
  const titleLines = titleFit.lines;
  const titleSize = titleFit.size;

  // Scale a single-line title up to fill the panel width, so "Claws" reads as a
  // poster rather than a footnote in a sea of white. Capped so a mid-length
  // title never balloons past the 70px base size.
  const singleLine = titleLines.length === 1;
  const targetWidth = titleMaxWidth;
  const atBase = serifWidth(title, 70);
  const titleScale =
    singleLine && atBase > 0
      ? Math.max(1, Math.min(1.6, targetWidth / atBase))
      : 1;
  const renderedTitleSize = Math.round(titleSize * titleScale);

  const descFit = description
    ? fitText(description, titleMaxWidth, descSize, 3, sansWidth)
    : { lines: [] as string[], size: descSize };
  const descLines = descFit.lines;
  const renderedDescSize = descFit.size;

  // A short title gets a little more presence: lift the baseline above the very
  // bottom so the card reads as a poster rather than a footnote.
  const shortTitleLift = singleLine ? 34 : 0;

  // Layout from the bottom up, mirroring the approved design.
  const footH = 28;
  const metaH = input.meta ? 26 : 0;
  let y = OG_HEIGHT - pad - footH - shortTitleLift;
  const metaY = y;
  y -= metaH;
  if (descLines.length) {
    y -= descLines.length * renderedDescSize * 1.42 + 24;
  }
  y -= titleLines.length * renderedTitleSize * 1.06;
  const titleY = y;

  const accentRuleY = metaY - (metaH ? 34 : 26);

  const parts: string[] = [];

  // Dither background (full bleed) + solid type panel over its left portion.
  if (ditherSvg) {
    parts.push(
      `<g>${ditherSvg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "")}</g>`
    );
    parts.push(
      `<rect x="0" y="0" width="${panelW}" height="${OG_HEIGHT}" fill="${theme.paper}"/>`
    );
  } else {
    parts.push(
      `<rect x="0" y="0" width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="${theme.paper}"/>`
    );
  }

  // Eyebrow.
  if (input.eyebrow) {
    parts.push(
      `<text x="${pad}" y="${pad + 14}" font-family="${esc(theme.monoFont)}" font-size="17" letter-spacing="1.7" fill="${theme.muted}">${esc(clamp(input.eyebrow.toUpperCase(), 58))}</text>`
    );
  }

  // Title, serif display, tight leading.
  titleLines.forEach((line, i) => {
    parts.push(
      `<text x="${pad}" y="${titleY + renderedTitleSize * (i + 0.82)}" font-family="${esc(theme.displayFont)}" font-size="${renderedTitleSize}" fill="${theme.ink}" letter-spacing="-1.2">${esc(line)}</text>`
    );
  });

  // Description.
  descLines.forEach((line, i) => {
    parts.push(
      `<text x="${pad}" y="${titleY + titleLines.length * renderedTitleSize * 1.06 + 24 + renderedDescSize * (i + 0.85)}" font-family="${esc(theme.sansFont)}" font-size="${renderedDescSize}" fill="${theme.muted}">${esc(line)}</text>`
    );
  });

  // Accent hairline.
  parts.push(
    `<rect x="${pad}" y="${accentRuleY}" width="72" height="5" rx="2.5" fill="${theme.accent}"/>`
  );

  // Meta line (date · read time).
  if (input.meta) {
    parts.push(
      `<text x="${pad}" y="${metaY}" font-family="${esc(theme.monoFont)}" font-size="18" fill="${theme.muted}">${esc(input.meta)}</text>`
    );
  }

  // Footer: site name + optional logo.
  const footY = OG_HEIGHT - pad;
  if (logoSvg) {
    parts.push(
      `<g transform="translate(${pad} ${footY - 26}) scale(0.41)">${logoSvg
        .replace(/^<svg[^>]*>/, "")
        .replace(/<\/svg>$/, "")}</g>`
    );
  }
  if (input.siteName) {
    const siteX = logoSvg ? pad + 40 : pad;
    parts.push(
      `<text x="${siteX}" y="${footY - 6}" font-family="${esc(theme.monoFont)}" font-size="18" fill="${theme.muted}">${esc(input.siteName)}</text>`
    );
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}">
${parts.join("\n")}
</svg>`;
}

/**
 * Fetch a source image into a Buffer, with a User-Agent.
 *
 * A UA is required: Wikimedia returns 403 to default fetch/undici agents, and
 * 195 of the 248 blog thumbnails are hosted on bp.blogspot.com /
 * blogger.googleusercontent.com, which behave the same way.
 *
 * Returns `undefined` on any failure so callers can fall back to a type card
 * rather than failing the whole build.
 */
export async function loadCardImage(
  source: string,
  opts: { timeoutMs?: number; retries?: number } = {}
): Promise<Buffer | undefined> {
  const { timeoutMs = 15_000, retries = 2 } = opts;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (/^https?:\/\//i.test(source)) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
          const res = await fetch(source, {
            signal: controller.signal,
            headers: {
              "user-agent":
                "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
              accept: "image/*,*/*;q=0.8",
            },
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return Buffer.from(await res.arrayBuffer());
        } finally {
          clearTimeout(timer);
        }
      }
      const { readFile } = await import("node:fs/promises");
      return await readFile(source);
    } catch {
      if (attempt === retries) return undefined;
      await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
    }
  }
  return undefined;
}

/**
 * Render one card to a PNG at `outPath`, creating parent directories.
 *
 * Falls back to a pure type card when the image cannot be fetched or decoded.
 */
export async function renderOgCard(
  input: CardInput,
  outPath: string,
  options: RenderCardOptions = {}
): Promise<{ path: string; usedImage: boolean }> {
  const sharp = (await import("sharp")).default;
  const style: DitherStyle = { ...DEFAULT_STYLE, ...options.style };
  const theme = { ...LIGHT_THEME, ...options.theme };

  let ditherSvg: string | undefined;
  let usedImage = false;

  if (input.image) {
    const buf = Buffer.isBuffer(input.image)
      ? input.image
      : await loadCardImage(input.image);
    if (buf) {
      try {
        const meta = await sharp(buf).metadata();
        ditherSvg = await ditherToSvg(
          buf,
          style,
          theme,
          meta.width ?? OG_WIDTH,
          meta.height ?? OG_HEIGHT
        );
        usedImage = true;
      } catch {
        ditherSvg = undefined;
      }
    }
  }

  const svg = cardToSvg(input, options, ditherSvg);
  await mkdir(dirname(outPath), { recursive: true });
  // `density: 144` (the github-stats recipe) would rasterize at 2x because these
  // SVGs carry explicit px width/height. Pin the raster size instead so the
  // output is always exactly 1200x630 regardless of libvips defaults.
  await sharp(Buffer.from(svg))
    .resize(OG_WIDTH, OG_HEIGHT, { fit: "fill" })
    .png({ compressionLevel: 9 })
    .toFile(outPath);

  return { path: outPath, usedImage };
}

/** Rasterize an SVG card to a PNG buffer (used by tests and previews). */
export async function cardToPng(
  input: CardInput,
  options: RenderCardOptions = {}
): Promise<Buffer> {
  const sharp = (await import("sharp")).default;
  const style: DitherStyle = { ...DEFAULT_STYLE, ...options.style };
  const theme = { ...LIGHT_THEME, ...options.theme };

  let ditherSvg: string | undefined;
  if (input.image) {
    const buf = Buffer.isBuffer(input.image)
      ? input.image
      : await loadCardImage(input.image);
    if (buf) {
      const meta = await sharp(buf).metadata();
      ditherSvg = await ditherToSvg(
        buf,
        style,
        theme,
        meta.width ?? OG_WIDTH,
        meta.height ?? OG_HEIGHT
      );
    }
  }
  return sharp(Buffer.from(cardToSvg(input, options, ditherSvg)))
    .resize(OG_WIDTH, OG_HEIGHT, { fit: "fill" })
    .png()
    .toBuffer();
}
