import { BURNS_LOCALE } from "./dates";

/** Canonical display names for coding agents shown on burn.duyet.net */
export const DISPLAY_SOURCES = [
  "Claude Code",
  "Codex",
  "Gemini CLI",
  "Grok",
  "opencode",
  "Z.AI",
  "Google Antigravity",
  "Hermes",
  "OpenClaw",
  "pi",
] as const;

export type DisplaySource = (typeof DISPLAY_SOURCES)[number];

const DISPLAY_BY_LOWER = new Map<string, string>(
  DISPLAY_SOURCES.map((name: string): [string, string] => [
    name.toLowerCase(),
    name,
  ])
);

function isZaiModel(modelName: string): boolean {
  const m = modelName.toLowerCase();
  return m.includes("glm") || m.includes("z-ai") || m.includes("zai");
}

/**
 * Map raw imported `source` (+ optional model) → display agent name.
 *
 * Labels follow the raw source. `gemini` is never Antigravity.
 */
export function normalizeSource(raw: string, modelName = ""): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;

  const s = trimmed.toLowerCase();
  const known = DISPLAY_BY_LOWER.get(s);
  if (known) return known;

  if (s === "antigravity" || s.includes("antigravity")) {
    return "Google Antigravity";
  }
  if (s === "gemini" || s.includes("gemini")) {
    return "Gemini CLI";
  }
  if (s === "opencode" || s.includes("opencode")) return "opencode";
  if (s === "codex" || s.includes("codex")) return "Codex";
  if (s === "grok" || s.includes("grok") || s.includes("xai")) return "Grok";
  if (s === "hermes" || s.includes("hermes")) return "Hermes";
  if (s === "openclaw" || s.includes("openclaw")) return "OpenClaw";
  if (s === "pi") return "pi";

  if (s.includes("z.ai") || s.includes("zai") || isZaiModel(modelName)) {
    return "Z.AI";
  }

  if (s === "ccusage" || s.includes("claude")) return "Claude Code";
  return trimmed;
}

export function fmtTokens(n: number): string {
  return n.toLocaleString(BURNS_LOCALE);
}

const COMPACT_UNITS = [
  [1e12, "T"],
  [1e9, "B"],
  [1e6, "M"],
  [1e3, "K"],
  [1, ""],
] as const;

/** ~3 significant digits, no trailing ".0". */
function threeDigits(x: number): number {
  if (x >= 100) return Math.round(x);
  return x >= 10 ? +x.toFixed(1) : +x.toFixed(2);
}

/**
 * Compact token count: T/B/M/K with ~3 significant digits and no trailing
 * ".0" ("8.76B", "12.3K", "189B"). A value that rounds up to 1000 moves to
 * the next unit instead of reading "1000K".
 */
export function fmtCompactTokens(n: number): string {
  if (!n) return "0";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  let at = COMPACT_UNITS.findIndex(([div]) => abs >= div);
  if (at < 0) at = COMPACT_UNITS.length - 1;
  let value = threeDigits(abs / COMPACT_UNITS[at][0]);
  if (value >= 1000 && at > 0) {
    at -= 1;
    value = threeDigits(abs / COMPACT_UNITS[at][0]);
  }
  return `${sign}${value}${COMPACT_UNITS[at][1]}`;
}

/** Dollars: commas from 1,000, whole dollars from 10, cents below. */
export function fmtCost(n: number): string {
  if (n >= 10) {
    return `$${Math.round(n).toLocaleString(BURNS_LOCALE)}`;
  }
  return `$${n.toFixed(2)}`;
}
