import { type JSX, useState } from "react";
import { formatDay, formatMonth } from "../lib/dates";
import {
  fmtCost,
  fmtTokens,
  normalizeSource,
  sourceSwatch,
} from "../lib/sources";
import type { DailyEntry, DailyEntrySource } from "../lib/types";

interface DailyChartProps {
  daily: DailyEntry[];
  /** When set, only this agent's usage is charted. */
  filter?: string | null;
  /** Number of most recent days to chart; null charts everything. */
  days?: number | null;
  granularity?: Granularity;
}

export const GRANULARITIES = [
  { key: "monthly", label: "Monthly" },
  { key: "daily", label: "Daily" },
] as const;

export type Granularity = (typeof GRANULARITIES)[number]["key"];

/** Roll daily entries up into one entry per calendar month. */
function byMonth(entries: DailyEntry[]): DailyEntry[] {
  const months = new Map<string, DailyEntry>();
  for (const d of entries) {
    const key = d.date.slice(0, 7);
    const month = months.get(key);
    if (!month) {
      months.set(key, {
        ...d,
        date: `${key}-01`,
        by_source: (d.by_source ?? []).map((s) => ({ ...s })),
      });
      continue;
    }
    month.total_tokens += d.total_tokens;
    month.cost += d.cost;
    for (const s of d.by_source ?? []) {
      const existing = month.by_source?.find((m) => m.source === s.source);
      if (existing) {
        existing.total_tokens += s.total_tokens;
        existing.cost += s.cost;
        continue;
      }
      month.by_source?.push({ ...s });
    }
  }
  return [...months.values()];
}

export const RANGES = [
  { key: "all", label: "All", days: null },
  { key: "12m", label: "12 months", days: 365 },
  { key: "90d", label: "90 days", days: 90 },
] as const;

export type RangeKey = (typeof RANGES)[number]["key"];
const CHART_H = 100;

function stackedTotal(d: DailyEntry): number {
  const sum = (d.by_source ?? []).reduce((acc, s) => acc + s.total_tokens, 0);
  return sum || d.total_tokens;
}

export function DailyChart({
  daily,
  filter = null,
  days = null,
  granularity = "daily",
}: DailyChartProps): JSX.Element | null {
  const [hovered, setHovered] = useState<number | null>(null);

  if (daily.length === 0) return null;

  const keep = (source: string) =>
    filter === null || normalizeSource(source) === filter;

  const windowed = (days === null ? daily.slice() : daily.slice(0, days))
    .reverse()
    .map((d) =>
      filter === null
        ? d
        : { ...d, by_source: (d.by_source ?? []).filter((s) => keep(s.source)) }
    );
  const recent = granularity === "monthly" ? byMonth(windowed) : windowed;
  const label = (iso: string, long = false) =>
    granularity === "monthly" ? formatMonth(iso) : formatDay(iso, long);
  const dayTotals = recent.map((d) =>
    filter === null
      ? { tokens: d.total_tokens, cost: d.cost }
      : (d.by_source ?? []).reduce(
          (acc, s) => ({
            tokens: acc.tokens + s.total_tokens,
            cost: acc.cost + s.cost,
          }),
          { tokens: 0, cost: 0 }
        )
  );
  const maxTokens =
    filter === null
      ? Math.max(...recent.map(stackedTotal), 1)
      : Math.max(...dayTotals.map((t) => t.tokens), 1);
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
    ...new Set(
      [
        recent[0]?.date,
        recent[Math.floor(recent.length / 2)]?.date,
        recent[recent.length - 1]?.date,
      ].filter(Boolean) as string[]
    ),
  ];

  return (
    <div className="burns-chart">
      <div className="burns-chart-frame">
        <svg
          viewBox={`0 0 100 ${CHART_H}`}
          preserveAspectRatio="none"
          role="img"
          aria-label="Daily token usage"
        >
          {recent.map((day, i) => {
            const gap = barWidth * 0.22;
            const w = Math.max(barWidth - gap, 0.2);
            const x = i * barWidth + gap / 2;
            const stack = (day.by_source ?? [])
              .map((s) => ({
                name: normalizeSource(s.source),
                tokens: s.total_tokens,
              }))
              .filter((s) => s.tokens > 0)
              .sort((a, b) => legend.indexOf(a.name) - legend.indexOf(b.name));

            const useStack = stack.length > 0;
            let y = CHART_H;
            const dim = hovered !== null && hovered !== i;
            const barAccess = {
              role: "button" as const,
              tabIndex: 0,
              "aria-label": `${day.date}: ${fmtTokens(dayTotals[i].tokens)} tokens, ${fmtCost(dayTotals[i].cost)}`,
              onMouseEnter: () => setHovered(i),
              onMouseLeave: () => setHovered(null),
              onFocus: () => setHovered(i),
              onBlur: () => setHovered(null),
              style: { cursor: "pointer" as const },
            };

            if (!useStack) {
              const h = (dayTotals[i].tokens / maxTokens) * CHART_H;
              return (
                <rect
                  key={day.date}
                  x={x}
                  y={CHART_H - h}
                  width={w}
                  height={h}
                  fill="var(--muted)"
                  opacity={dim ? 0.35 : 1}
                  {...barAccess}
                />
              );
            }

            return (
              <g key={day.date} opacity={dim ? 0.35 : 1} {...barAccess}>
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

        {hovered !== null &&
          hoveredDay &&
          (() => {
            const pct = hovered * barWidth + barWidth / 2;
            // Abspos width is the leftover space after `left`. Pin with
            // `right` on the trailing edge so the box can grow leftward.
            const edge =
              pct < 18 ? "start" : pct > 82 ? "end" : "center";
            const style =
              edge === "start"
                ? { left: 0, right: "auto", transform: "none" }
                : edge === "end"
                  ? { left: "auto", right: 0, transform: "none" }
                  : {
                      left: `${pct}%`,
                      right: "auto",
                      transform: "translateX(-50%)",
                    };
            return (
              <div className="burns-tooltip" style={style}>
                <div className="burns-tooltip-title">
                  {label(hoveredDay.date, true)}
                </div>
                {sources.length > 0 ? (
                  <div className="burns-tooltip-grid">
                    {sources.map((s) => (
                      <div key={s.name} style={{ display: "contents" }}>
                        <span
                          className="burns-swatch"
                          style={{ background: sourceSwatch(s.name) }}
                        />
                        <span>{s.name}</span>
                        <span
                          style={{ color: "var(--muted)", textAlign: "right" }}
                        >
                          {fmtTokens(s.total_tokens)}
                        </span>
                        <span
                          style={{
                            color: "var(--muted-soft)",
                            textAlign: "right",
                          }}
                        >
                          {fmtCost(s.cost)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontVariantNumeric: "tabular-nums" }}>
                    {fmtTokens(dayTotals[hovered].tokens)} tokens
                  </div>
                )}
                <div className="burns-tooltip-foot">
                  <span>{fmtTokens(dayTotals[hovered].tokens)} total</span>
                  <span>{fmtCost(dayTotals[hovered].cost)}</span>
                </div>
              </div>
            );
          })()}
      </div>

      <div className="burns-chart-axis">
        {ticks.map((d) => (
          <span key={d}>{label(d)}</span>
        ))}
      </div>

      {legend.length > 0 && (
        <ul className="burns-legend">
          {legend.map((name) => (
            <li key={name}>
              <span
                className="burns-swatch"
                style={{ background: sourceSwatch(name) }}
              />
              {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
