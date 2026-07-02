import { useEffect, useState } from "react";

const API = "https://github-contributions-api.deno.dev/duyet.json";
const CACHE_KEY = "gh-contrib";
const CACHE_TTL = 86_400_000; // 24h

// SVG geometry in viewBox units; the whole grid scales fluidly to the
// container width via a viewBox, so cells stay crisp from 320px up.
const CELL = 11;
const GAP = 2.5;
const PITCH = CELL + GAP;
const RADIUS = 2.5;

// Sequential 5-step ramp derived from the theme accent so the heatmap
// respects light/dark tokens instead of hardcoded GitHub greens. Empty
// days use the muted surface; density mixes more accent toward the top.
const RAMP = [
  "var(--rd-surface-2)",
  "color-mix(in srgb, var(--rd-accent) 26%, var(--rd-surface-2))",
  "color-mix(in srgb, var(--rd-accent) 50%, var(--rd-surface-2))",
  "color-mix(in srgb, var(--rd-accent) 74%, var(--rd-surface-2))",
  "var(--rd-accent)",
];

const LEVEL_INDEX: Record<string, number> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

interface Day {
  date: string;
  contributionCount: number;
  contributionLevel: string;
}

interface Cached {
  ts: number;
  data: Day[][];
}

function getCached(): Day[][] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const c: Cached = JSON.parse(raw);
    if (Date.now() - c.ts > CACHE_TTL) return null;
    return c.data;
  } catch {
    return null;
  }
}

function setCache(data: Day[][]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch {
    // storage full or unavailable
  }
}

function levelColor(level: string): string {
  return RAMP[LEVEL_INDEX[level] ?? 0];
}

export function GitHubContributions() {
  const [data, setData] = useState<Day[][] | null>(null);

  useEffect(() => {
    const cached = getCached();
    if (cached) {
      setData(cached);
      return;
    }
    fetch(API)
      .then((r) => r.json())
      .then((json) => {
        const weeks: Day[][] = json.contributions;
        setCache(weeks);
        setData(weeks);
      })
      .catch(() => {});
  }, []);

  if (!data) return <div className="mt-4" />;

  const total = data.flat().reduce((s, d) => s + d.contributionCount, 0);
  const width = data.length * PITCH - GAP;
  const height = 7 * PITCH - GAP;
  const totalLabel = total.toLocaleString();

  return (
    <div className="mt-4 select-none">
      <div className="font-[var(--font-mono)] text-[11px] text-[var(--rd-text-3)] mb-1.5">
        {totalLabel} contributions in the last year
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`GitHub contribution heatmap: ${totalLabel} contributions in the last year`}
        style={{ display: "block", height: "auto" }}
      >
        {data.flatMap((week, wi) =>
          week.map((day, di) => (
            <rect
              key={`${wi}-${di}`}
              x={wi * PITCH}
              y={di * PITCH}
              width={CELL}
              height={CELL}
              rx={RADIUS}
              ry={RADIUS}
              fill={levelColor(day.contributionLevel)}
            >
              <title>{`${day.contributionCount} on ${day.date}`}</title>
            </rect>
          )),
        )}
      </svg>
      <div className="mt-2 flex items-center gap-1.5 font-[var(--font-mono)] text-[10px] text-[var(--rd-text-3)]">
        <span>Less</span>
        {RAMP.map((c) => (
          <span
            key={c}
            aria-hidden="true"
            className="inline-block h-2.5 w-2.5 rounded-[2px]"
            style={{ backgroundColor: c }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
