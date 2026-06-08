import { useEffect, useState } from "react";

const API = "https://github-contributions-api.deno.dev/duyet.json";
const CACHE_KEY = "gh-contrib";
const CACHE_TTL = 86_400_000; // 24h

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

function levelToColor(level: string): string {
  switch (level) {
    case "FIRST_QUARTILE":
      return "#0e4429";
    case "SECOND_QUARTILE":
      return "#006d32";
    case "THIRD_QUARTILE":
      return "#26a641";
    case "FOURTH_QUARTILE":
      return "#39d353";
    default:
      return "var(--rd-border)";
  }
}

export function GitHubContributions() {
  const [data, setData] = useState<Day[][] | null>(getCached());

  useEffect(() => {
    if (data) return;
    fetch(API)
      .then((r) => r.json())
      .then((json) => {
        const weeks: Day[][] = json.contributions;
        setCache(weeks);
        setData(weeks);
      })
      .catch(() => {});
  }, [data]);

  if (!data) return null;

  const total = data.flat().reduce((s, d) => s + d.contributionCount, 0);

  return (
    <div className="mt-4 select-none">
      <div className="font-[var(--font-mono)] text-[11px] text-[var(--rd-text-3)] mb-1.5">
        {total.toLocaleString()} contributions in the last year
      </div>
      <div
        className="grid"
        style={{
          gridTemplateRows: "repeat(7, 1fr)",
          gridTemplateColumns: `repeat(${data.length}, 1fr)`,
          gap: "1.5px",
          width: "fit-content",
        }}
      >
        {data.flatMap((week, wi) =>
          week.map((day, di) => (
            <div
              key={`${wi}-${di}`}
              style={{
                width: 4,
                height: 4,
                borderRadius: 1,
                backgroundColor: levelToColor(day.contributionLevel),
              }}
            />
          )),
        )}
      </div>
    </div>
  );
}
