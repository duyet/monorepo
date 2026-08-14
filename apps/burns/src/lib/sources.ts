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

export const SOURCE_COLORS: Record<string, string> = {
  "Claude Code": "#D97757",
  Codex: "#10A37F",
  "Gemini CLI": "#4B64E8",
  Grok: "#1A1A1A",
  opencode: "#7C3AED",
  "Z.AI": "#111111",
  "Google Antigravity": "#FFE432",
  Hermes: "#6366F1",
  OpenClaw: "#0EA5E9",
  pi: "#F59E0B",
};

const DISPLAY_BY_LOWER = new Map<string, string>(
  DISPLAY_SOURCES.map((name) => [name.toLowerCase(), name]),
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

export function sourceSwatch(name: string): string {
  if (name === "Z.AI" || name === "Grok") return "#737373";
  return SOURCE_COLORS[name] ?? "var(--muted)";
}

export function fmtTokens(n: number): string {
  return n.toLocaleString("en-US");
}

export function fmtCompactTokens(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(1)}T`;
  if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(1)}K`;
  return n.toLocaleString("en-US");
}

export function fmtCost(n: number): string {
  return `$${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
