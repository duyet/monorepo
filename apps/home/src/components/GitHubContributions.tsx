import { Heatmap } from "@duyet/components";
import { useEffect, useState } from "react";
import {
  type ContributionDay,
  GH_CONTRIB_API,
  type JoguberDay,
  weeksFromJoguber,
} from "../lib/github-contributions";

const CACHE_KEY = "gh-contrib-v2";
const CACHE_TTL = 86_400_000; // 24h

// SVG geometry in viewBox units; the whole grid scales fluidly to the
// container width via a viewBox, so cells stay crisp from 320px up.
const CELL = 11;
const GAP = 2.5;
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

interface Cached {
  ts: number;
  data: ContributionDay[][];
}

function getCached(): ContributionDay[][] | null {
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

function setCache(data: ContributionDay[][]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch {
    // storage full or unavailable
  }
}

export function GitHubContributions() {
  const [data, setData] = useState<ContributionDay[][] | null>(null);

  useEffect(() => {
    const cached = getCached();
    if (cached) {
      setData(cached);
      return;
    }
    fetch(GH_CONTRIB_API)
      .then((r) => {
        if (!r.ok) throw new Error(`contrib ${r.status}`);
        return r.json() as Promise<{ contributions: JoguberDay[] }>;
      })
      .then((json) => {
        const weeks = weeksFromJoguber(json.contributions ?? []);
        setCache(weeks);
        setData(weeks);
      })
      .catch(() => {});
  }, []);

  if (!data || data.length === 0) return <div className="mt-4" />;

  const total = data.flat().reduce((s, d) => s + d.contributionCount, 0);
  const totalLabel = total.toLocaleString();
  const heatmap = data.map((week) =>
    week.map((day) => ({
      value: LEVEL_INDEX[day.contributionLevel] ?? 0,
      title: `${day.contributionCount} on ${day.date}`,
    }))
  );

  return (
    <div className="mt-4 select-none">
      <div className="font-[var(--font-mono)] text-[11px] text-[var(--rd-text-3)] mb-1.5">
        {totalLabel} contributions in the last year
      </div>
      <Heatmap
        ariaLabel={`GitHub contribution heatmap: ${totalLabel} contributions in the last year`}
        cell={CELL}
        colorRamp={RAMP}
        data={heatmap}
        gap={GAP}
        maxValue={4}
        radius={RADIUS}
      />
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
