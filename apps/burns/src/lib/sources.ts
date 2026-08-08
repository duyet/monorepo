/** Canonical display names for coding agents shown on burn.duyet.net */
export const DISPLAY_SOURCES = [
  "Google Antigravity",
  "Z.AI",
  "opencode",
  "Claude Code",
  "Codex",
  "Grok",
] as const;

export type DisplaySource = (typeof DISPLAY_SOURCES)[number];

export const SOURCE_COLORS: Record<string, string> = {
  "Google Antigravity": "#FFE432",
  "Z.AI": "#111111",
  Grok: "#1A1A1A",
  opencode: "#7C3AED",
  "Claude Code": "#D97757",
  Codex: "#10A37F",
  Hermes: "#6366F1",
  OpenClaw: "#0EA5E9",
  pi: "#F59E0B",
};

/** Map raw MotherDuck `source` (+ optional model) → display agent name. */
export function normalizeSource(raw: string, modelName = ""): string {
  const s = raw.toLowerCase();
  const m = modelName.toLowerCase();

  if (s === "antigravity" || s.includes("antigravity") || s === "gemini" || s.includes("agy")) {
    return "Google Antigravity";
  }
  if (s === "opencode" || s.includes("opencode")) return "opencode";
  if (s === "codex" || s.includes("codex")) return "Codex";
  if (s === "grok" || s.includes("grok") || s.includes("xai")) return "Grok";
  if (s === "hermes" || s.includes("hermes")) return "Hermes";
  if (s === "openclaw" || s.includes("openclaw")) return "OpenClaw";
  if (s === "pi") return "pi";

  // Z.AI / GLM models often ride Claude Code (ccusage) or openclaw free tiers
  if (
    m.includes("glm") ||
    m.includes("z-ai") ||
    m.includes("zai") ||
    s.includes("z.ai") ||
    s.includes("zai")
  ) {
    return "Z.AI";
  }

  if (s === "ccusage" || s.includes("claude")) return "Claude Code";
  return raw;
}

export function fmtTokens(n: number): string {
  return n.toLocaleString("en-US");
}

export function fmtCost(n: number): string {
  return `$${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
