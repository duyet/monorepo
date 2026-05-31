import type { DailyEntry } from "../lib/types";
import { useState } from "react";

interface DailyChartProps {
  daily: DailyEntry[];
  firstDate: string | null;
  lastDate: string | null;
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
    ? `Since ${format(firstDate)} — ${format(lastDate)}`
    : `Last ${recent.length} days`;

  const hoveredDay = hovered !== null ? recent[hovered] : null;

  return (
    <div className="animate-fade-in-delay" style={{ width: "100%", maxWidth: 640, margin: "0 auto" }}>
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

        {hoveredDay && (() => {
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
              padding: "4px 8px",
              borderRadius: 4,
              fontSize: 11,
              fontFamily: "var(--sans)",
              lineHeight: 1.4,
              whiteSpace: "nowrap",
              background: "var(--surface-card)",
              border: "1px solid var(--hairline)",
              color: "var(--ink)",
              boxShadow: "none",
              pointerEvents: "none",
            }}>
              <div style={{ fontWeight: 500 }}>{format(hoveredDay.date)}</div>
              <div>{hoveredDay.total_tokens.toLocaleString("en-US")} tokens</div>
              <div style={{ color: "var(--muted)" }}>${hoveredDay.cost.toFixed(2)}</div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
