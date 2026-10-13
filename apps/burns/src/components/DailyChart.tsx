import {
  type CSSProperties,
  type FocusEvent as ReactFocusEvent,
  type JSX,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type MouseEvent as ReactMouseEvent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { formatDay, formatMonth, formatMonthLong } from "../lib/dates";
import { fmtCompactTokens, fmtCost, fmtTokens } from "../lib/sources";
import {
  byMonth,
  type Column,
  columnTotal,
  type Day,
  type Range,
  type Series,
  seriesIndex,
  seriesTotals,
  sliceRange,
  toColumns,
  type View,
  visibleTokens,
} from "../lib/usage";
import { SourceIcon } from "./SourceIcons";

interface DailyChartProps {
  /** Every day, oldest first. */
  days: readonly Day[];
  series: readonly Series[];
  /** When set, only this agent is charted. */
  filter: string | null;
  onClearFilter: () => void;
  range: Range;
  view: View;
}

/** Bars grow in one after another on first load. */
const INTRO_STAGGER_MS = 6;
const INTRO_MS = 900;

/** Roving-tabindex arrow handling: the bar to focus after `key`, or null. */
export function nextBarIndex(
  key: string,
  current: number,
  count: number
): number | null {
  switch (key) {
    case "ArrowLeft":
      return Math.max(current - 1, 0);
    case "ArrowRight":
      return Math.min(current + 1, count - 1);
    case "Home":
      return 0;
    case "End":
      return count - 1;
    default:
      return null;
  }
}

function gapFor(bars: number): string {
  if (bars > 200) return "1px";
  return bars > 60 ? "3px" : "6px";
}

function barLabel(date: string, view: View, long = false): string {
  if (view === "monthly")
    return long ? formatMonthLong(date) : formatMonth(date);
  return formatDay(date);
}

export function DailyChart({
  days,
  series,
  filter,
  onClearFilter,
  range,
  view,
}: DailyChartProps): JSX.Element {
  const [hidden, setHidden] = useState<ReadonlySet<string>>(new Set());
  const [hovered, setHovered] = useState<number | null>(null);
  // Touch has no hover: a tap pins the bar's tooltip until the next tap away.
  const [pinned, setPinned] = useState<number | null>(null);
  // Roving tabindex: the chart is one tab stop, arrows move between bars.
  const [active, setActive] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const [intro, setIntro] = useState(true);
  const [peakLeft, setPeakLeft] = useState<number | null>(null);

  const chartRef = useRef<HTMLDivElement>(null);
  const barsRef = useRef<HTMLDivElement>(null);
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tipRef = useRef<HTMLDivElement>(null);
  const crossRef = useRef<HTMLDivElement>(null);
  const peakRef = useRef<HTMLDivElement>(null);

  // First load: bars start at 0 and grow in, then the stagger is dropped so
  // later range/view/filter changes morph all bars together.
  useEffect(() => {
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setReady(true));
    });
    const done = setTimeout(() => setIntro(false), INTRO_MS);
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
      clearTimeout(done);
    };
  }, []);

  // An agent filter replaces the legend, so switched-off keys start over.
  useEffect(() => setHidden(new Set()), [filter]);

  useEffect(() => {
    if (pinned === null) return;
    const dismiss = (e: PointerEvent) => {
      if (!chartRef.current?.contains(e.target as Node)) setPinned(null);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [pinned]);

  const columns = useMemo(() => {
    const window = sliceRange(days, range);
    return toColumns(
      view === "monthly" ? byMonth(window) : window,
      series,
      filter
    );
  }, [days, range, view, series, filter]);

  const totals = columns.map((c) => visibleTokens(c, series, hidden));
  const max = Math.max(0, ...totals);
  const peak = max > 0 ? totals.indexOf(max) : -1;
  const peakText =
    peak < 0
      ? ""
      : `${fmtCompactTokens(max)} · ${barLabel(columns[peak].date, view)}`;

  const requested = hovered ?? pinned;
  const shown = requested !== null && columns[requested] ? requested : null;

  useLayoutEffect(() => {
    const chart = chartRef.current;
    const tip = tipRef.current;
    const cross = crossRef.current;
    const bar = shown === null ? null : barRefs.current[shown];
    if (!chart || !tip || !cross || !bar) return;
    const cr = chart.getBoundingClientRect();
    const br = bar.getBoundingClientRect();
    const cx = br.left - cr.left + br.width / 2;
    const tx = Math.min(
      Math.max(cx - tip.offsetWidth / 2, 0),
      Math.max(cr.width - tip.offsetWidth, 0)
    );
    const ty = Math.max(
      br.top - cr.top - tip.offsetHeight - 12,
      -tip.offsetHeight - 4
    );
    // A tooltip that just appeared is placed in one go; only column-to-column
    // moves glide.
    const fresh = tip.dataset.placed !== "1";
    if (fresh) tip.style.transition = "none";
    tip.style.transform = `translate(${tx}px, ${ty}px)`;
    cross.style.transform = `translateX(${cx}px)`;
    if (fresh) {
      void tip.offsetWidth;
      tip.style.transition = "";
      tip.dataset.placed = "1";
    }
  }, [shown, columns]);

  // The peak label stays inside the chart, so it needs real widths.
  useLayoutEffect(() => {
    const bars = barsRef.current;
    const label = peakRef.current;
    if (!bars || !label || peak < 0) return;
    const place = () => {
      const half = label.offsetWidth / 2;
      const at = ((peak + 0.5) / columns.length) * bars.clientWidth;
      setPeakLeft(
        Math.min(Math.max(at, half), Math.max(bars.clientWidth - half, half))
      );
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(bars);
    return () => observer.disconnect();
  }, [peak, peakText, columns.length]);

  const columnAt = (clientX: number): number | null => {
    const rect = barsRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || columns.length === 0) return null;
    const at = Math.floor(
      ((clientX - rect.left) / rect.width) * columns.length
    );
    return Math.min(columns.length - 1, Math.max(0, at));
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    // Touch fires compatibility mouse events after a tap; hover from those
    // would stick and stop a second tap from dismissing.
    if (e.pointerType === "touch") return;
    const at = columnAt(e.clientX);
    if (at !== null && at !== hovered) setHovered(at);
  };

  const onClick = (e: ReactMouseEvent) => {
    const bar = (e.target as Element).closest<HTMLElement>("[data-i]");
    const at = bar ? Number(bar.dataset.i) : columnAt(e.clientX);
    if (at === null || Number.isNaN(at)) return;
    setPinned((p) => (p === at ? null : at));
  };

  const tabStop =
    active !== null && active < columns.length ? active : columns.length - 1;
  const gap = gapFor(columns.length);
  const sums = seriesTotals(columns);
  const all = sums.reduce((a, b) => a + b, 0);
  const keys = series
    .map((s, i) => ({ s, tokens: sums[i] ?? 0 }))
    .filter(({ tokens }) => tokens > 0);

  const toggle = (key: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else if (keys.filter(({ s }) => !prev.has(s.key)).length > 1)
        next.add(key);
      return next;
    });

  const column: Column | undefined =
    shown === null ? undefined : columns[shown];
  const tipRows = column
    ? series
        .map((s, j) => ({ s, tokens: column.tokens[j], cost: column.cost[j] }))
        .filter((r) => r.tokens > 0)
        .sort((a, b) => b.tokens - a.tokens)
    : [];
  const filterSeries =
    filter === null ? null : series[seriesIndex(series, filter)];

  return (
    <>
      <div
        className="burns-chart"
        ref={chartRef}
        data-active={shown !== null || undefined}
        onPointerMove={onPointerMove}
        onPointerLeave={(e) => {
          if (e.pointerType !== "touch") setHovered(null);
        }}
        onClick={onClick}
      >
        <div
          className="burns-bars"
          ref={barsRef}
          style={{ "--gap": gap } as CSSProperties}
        >
          {/* Bars are keyed by position so a range change morphs them, not remounts. */}
          {columns.map((col, i) => {
            const tot = totals[i];
            const height = ready && max > 0 ? (tot / max) * 100 : 0;
            const { tokens, cost } = columnTotal(col);
            return (
              <div
                key={i}
                role="button"
                data-i={i}
                data-on={shown === i || undefined}
                className="burns-bar"
                tabIndex={i === tabStop ? 0 : -1}
                ref={(el) => {
                  barRefs.current[i] = el;
                }}
                aria-label={`${barLabel(col.date, view, true)}: ${fmtTokens(tokens)} tokens, ${fmtCost(cost)}`}
                style={{
                  height: `${height}%`,
                  transitionDelay: intro ? `${i * INTRO_STAGGER_MS}ms` : "0ms",
                }}
                onFocus={(e: ReactFocusEvent) => {
                  setActive(i);
                  // Tap and click focus too; only keyboard focus shows the tip.
                  if (e.currentTarget.matches(":focus-visible")) setHovered(i);
                }}
                onBlur={() => setHovered(null)}
                onKeyDown={(e: KeyboardEvent) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setPinned((p) => (p === i ? null : i));
                    return;
                  }
                  if (e.key === "Escape") {
                    setPinned(null);
                    return;
                  }
                  const next = nextBarIndex(e.key, i, columns.length);
                  if (next === null) return;
                  e.preventDefault();
                  barRefs.current[next]?.focus();
                }}
              >
                {series.map((s, j) => (
                  <span
                    key={s.key}
                    style={{
                      background: s.color,
                      height: `${hidden.has(s.key) || !tot ? 0 : (col.tokens[j] / tot) * 100}%`,
                    }}
                  />
                ))}
              </div>
            );
          })}
        </div>
        <div className="burns-cross" ref={crossRef} />
        <div
          className="burns-peak"
          ref={peakRef}
          data-ready={(ready && peakLeft !== null) || undefined}
          style={{ left: peakLeft ?? 0 }}
        >
          {peakText}
        </div>
        {column && (
          <div className="burns-tooltip" ref={tipRef}>
            <div className="burns-tip-head">
              <b>{barLabel(column.date, view, true)}</b>
              <span className="burns-tip-total">
                {fmtCompactTokens(columnTotal(column).tokens)} ·{" "}
                {fmtCost(columnTotal(column).cost)}
              </span>
            </div>
            {tipRows.map(({ s, tokens, cost }) => {
              const name = filter ?? s.label;
              return (
                <div className="burns-tip-row" key={s.key}>
                  <span className="burns-tip-name">
                    <i
                      className="burns-tip-swatch"
                      style={{ background: s.color }}
                    />
                    <span className="burns-tip-icon">
                      <SourceIcon name={name} />
                    </span>
                    {name}
                  </span>
                  <span>{fmtCompactTokens(tokens)}</span>
                  <span className="burns-tip-cost">{fmtCost(cost)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="burns-legend-line">
        <div className="burns-keys">
          {filter !== null && filterSeries ? (
            <button type="button" className="burns-key" onClick={onClearFilter}>
              <i style={{ background: filterSeries.color }} />
              {filter} <small>× clear</small>
            </button>
          ) : (
            keys.map(({ s, tokens }) => {
              const share = (tokens / all) * 100;
              return (
                <button
                  type="button"
                  key={s.key}
                  className="burns-key"
                  title={s.members.join(", ")}
                  aria-pressed={!hidden.has(s.key)}
                  onClick={() => toggle(s.key)}
                >
                  <i style={{ background: s.color }} />
                  {s.label}{" "}
                  <small>{share < 1 ? "<1" : Math.round(share)}%</small>
                </button>
              );
            })
          )}
        </div>
        <div className="burns-total">
          <b>{fmtCompactTokens(all)}</b> tokens · {range.scope}
        </div>
      </div>
    </>
  );
}
