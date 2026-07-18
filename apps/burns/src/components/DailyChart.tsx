import type { DailyEntry, DailyEntrySource } from "../lib/types";
import { useState } from "react";

interface DailyChartProps {
  daily: DailyEntry[];
  firstDate: string | null;
  lastDate: string | null;
}

const SOURCE_COLORS: Record<string, string> = {
  "Google Antigravity": "#FFE432",
  "Z.AI": "#111111",
  Grok: "#1A1A1A",
  opencode: "#7C3AED",
  "Claude Code": "#D97757",
  Codex: "#10A37F",
};

function normalizeSource(raw: string): string {
  const s = raw.toLowerCase();
  if (s.includes("antigravity") || s.includes("agy") || s.includes("gemini")) return "Google Antigravity";
  if (s.includes("z.ai") || s.includes("glm") || s.includes("zai")) return "Z.AI";
  if (s.includes("grok") || s.includes("xai")) return "Grok";
  if (s.includes("opencode")) return "opencode";
  if (s.includes("claude")) return "Claude Code";
  if (s.includes("codex")) return "Codex";
  return raw;
}

function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

export function DailyChart({ daily, firstDate, lastDate }: DailyChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (daily.length === 0) return null;

  const recent = daily.slice(0, 60);
  const maxTokens = Math.max(...recent.map((d) => d.total_tokens));
  const barWidth = 100 / recent.length;
  const chartHeight = 60;

  const format = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const sinceLabel = firstDate && lastDate
    ? `${format(firstDate)} — ${format(lastDate)}`
    : `Last ${recent.length} days`;

  const hoveredDay = hovered !== null ? recent[hovered] : null;

  const sources = (hoveredDay?.by_source ?? [])
    .map((s: DailyEntrySource) => ({ ...s, name: normalizeSource(s.source) }))
    .sort((a, b) => b.total_tokens - a.total_tokens);

  return (
    <div style={{ width: "100%", maxWidth: 640, margin: "0 auto" }}>
      <p style={{
        marginBottom: 8,
        textAlign: "center",
        fontSize: 11,
        letterSpacing: "0.04em",
        color: "var(--muted-soft)",
      }}>
        {sinceLabel}
      </p>
      <div style={{ position: "relative", width: "100%" }}>
        <svg
          viewBox={`0 0 100 ${chartHeight}`}
          style={{ width: "100%", height: 80, display: "block" }}
          preserveAspectRatio="none"
        >
          {recent.map((day, i) => {
            const height = maxTokens > 0 ? (day.total_tokens / maxTokens) * chartHeight : 0;
            const gap = barWidth * 0.2;
            const w = barWidth - gap;
            const x = i * barWidth + gap / 2;
            const y = chartHeight - height;
            return (
              <rect
                key={day.date}
                x={x}
                y={y}
                width={w}
                height={height}
                fill={hovered === i ? "var(--muted)" : "var(--hairline)"}
                className="transition-colors"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: "pointer" }}
              />
            );
          })}
        </svg>

        {hovered !== null && hoveredDay && (() => {
          const barCenter = (hovered * barWidth) + barWidth / 2;
          const pct = barCenter;
          const flip = pct > 70;
          return (
            <div style={{
              position: "absolute",
              bottom: "100%",
              left: `${pct}%`,
              transform: `translateX(${flip ? "-100%" : "-50%"})`,
              marginBottom: 4,
              padding: "8px 10px",
              borderRadius: 6,
              fontSize: 11,
              fontFamily: "var(--sans)",
              lineHeight: 1.5,
              whiteSpace: "nowrap",
              background: "var(--surface-card)",
              border: "1px solid var(--hairline)",
              color: "var(--ink)",
              boxShadow: "0 2px 8px rgb(0 0 0 / 0.12)",
              pointerEvents: "none",
              textAlign: "left",
            }}>
              <div style={{ fontWeight: 500, marginBottom: 4 }}>{format(hoveredDay.date)}</div>
              {sources.length > 0 ? (
                sources.map((s) => (
                  <div key={s.name} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontVariantNumeric: "tabular-nums",
                  }}>
                    <span style={{
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      flexShrink: 0,
                      background: SOURCE_COLORS[s.name] ?? "var(--muted)",
                    }} />
                    <span style={{ minWidth: 84 }}>{s.name}</span>
                    <span style={{ color: "var(--muted)" }}>{fmt(s.total_tokens)}</span>
                  </div>
                ))
              ) : (
                <div>{hoveredDay.total_tokens.toLocaleString("en-US")} tokens</div>
              )}
              <div style={{ color: "var(--muted)", marginTop: 4 }}>
                ${hoveredDay.cost.toFixed(2)}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
