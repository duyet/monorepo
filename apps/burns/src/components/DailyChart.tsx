import { useState } from "react";
import type { DailyEntry, DailyEntrySource } from "../lib/types";
import { fmtCost, fmtTokens, normalizeSource, sourceSwatch } from "../lib/sources";

interface DailyChartProps {
  daily: DailyEntry[];
}

const WINDOW = 90;
const CHART_H = 100;

function shortDate(d: string): string {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function longDate(d: string): string {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function DailyChart({ daily }: DailyChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (daily.length === 0) return null;

  const recent = daily.slice(0, WINDOW).reverse();
  const maxTokens = Math.max(...recent.map((d) => d.total_tokens), 1);
  const barWidth = 100 / recent.length;

  const totals = new Map<string, number>();
  for (const day of recent) {
    for (const s of day.by_source ?? []) {
      const name = normalizeSource(s.source);
      totals.set(name, (totals.get(name) ?? 0) + s.total_tokens);
    }
  }
  const legend = [...totals.entries()]
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);

  const hoveredDay = hovered !== null ? recent[hovered] : null;
  const sources = (hoveredDay?.by_source ?? [])
    .map((s: DailyEntrySource) => ({
      ...s,
      name: normalizeSource(s.source),
    }))
    .filter((s) => s.total_tokens > 0 || s.cost > 0)
    .sort((a, b) => b.total_tokens - a.total_tokens);

  const ticks = [
    recent[0]?.date,
    recent[Math.floor(recent.length / 2)]?.date,
    recent[recent.length - 1]?.date,
  ].filter(Boolean) as string[];

  return (
    <div className="burns-chart">
      <div className="burns-chart-frame">
        <svg
          viewBox={`0 0 100 ${CHART_H}`}
          preserveAspectRatio="none"
          aria-label="Daily token usage"
        >
          {recent.map((day, i) => {
            const gap = barWidth * 0.22;
            const w = Math.max(barWidth - gap, 0.2);
            const x = i * barWidth + gap / 2;
            const stack = (day.by_source ?? [])
              .map((s) => ({ name: normalizeSource(s.source), tokens: s.total_tokens }))
              .filter((s) => s.tokens > 0)
              .sort((a, b) => legend.indexOf(a.name) - legend.indexOf(b.name));

            const useStack = stack.length > 0;
            let y = CHART_H;
            const dim = hovered !== null && hovered !== i;

            if (!useStack) {
              const h = (day.total_tokens / maxTokens) * CHART_H;
              return (
                <rect
                  key={day.date}
                  x={x}
                  y={CHART_H - h}
                  width={w}
                  height={h}
                  fill="var(--muted)"
                  opacity={dim ? 0.35 : 1}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: "pointer" }}
                />
              );
            }

            return (
              <g
                key={day.date}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: "pointer" }}
                opacity={dim ? 0.35 : 1}
              >
                {stack.map((seg) => {
                  const h = (seg.tokens / maxTokens) * CHART_H;
                  y -= h;
                  return (
                    <rect
                      key={`${day.date}-${seg.name}`}
                      x={x}
                      y={y}
                      width={w}
                      height={h}
                      fill={sourceSwatch(seg.name)}
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>

        {hovered !== null && hoveredDay && (() => {
          const pct = hovered * barWidth + barWidth / 2;
          const flip = pct > 68;
          return (
            <div
              className="burns-tooltip"
              style={{
                left: `${pct}%`,
                transform: `translateX(${flip ? "-100%" : "-50%"})`,
              }}
            >
              <div className="burns-tooltip-title">{longDate(hoveredDay.date)}</div>
              {sources.length > 0 ? (
                <div className="burns-tooltip-grid">
                  {sources.map((s) => (
                    <div key={s.name} style={{ display: "contents" }}>
                      <span className="burns-swatch" style={{ background: sourceSwatch(s.name) }} />
                      <span>{s.name}</span>
                      <span style={{ color: "var(--muted)", textAlign: "right" }}>
                        {fmtTokens(s.total_tokens)}
                      </span>
                      <span style={{ color: "var(--muted-soft)", textAlign: "right" }}>
                        {fmtCost(s.cost)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontVariantNumeric: "tabular-nums" }}>
                  {fmtTokens(hoveredDay.total_tokens)} tokens
                </div>
              )}
              <div className="burns-tooltip-foot">
                <span>{fmtTokens(hoveredDay.total_tokens)} total</span>
                <span>{fmtCost(hoveredDay.cost)}</span>
              </div>
            </div>
          );
        })()}
      </div>

      <div className="burns-chart-axis">
        {ticks.map((d) => (
          <span key={d}>{shortDate(d)}</span>
        ))}
      </div>

      {legend.length > 0 && (
        <ul className="burns-legend">
          {legend.map((name) => (
            <li key={name}>
              <span className="burns-swatch" style={{ background: sourceSwatch(name) }} />
              {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
