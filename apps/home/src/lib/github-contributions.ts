export const GH_CONTRIB_API =
  "https://github-contributions-api.jogruber.de/v4/duyet";

const LEVELS = [
  "NONE",
  "FIRST_QUARTILE",
  "SECOND_QUARTILE",
  "THIRD_QUARTILE",
  "FOURTH_QUARTILE",
] as const;

export interface ContributionDay {
  date: string;
  contributionCount: number;
  contributionLevel: string;
}

export interface JoguberDay {
  date: string;
  count: number;
  level: number;
}

/** Last ~53 weeks, Sunday-aligned, matching GitHub's heatmap. */
export function weeksFromJoguber(days: JoguberDay[]): ContributionDay[][] {
  if (!days.length) return [];

  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - 370);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const recent = days.filter((d) => d.date >= cutoffStr);
  if (!recent.length) return [];

  const start = recent.findIndex((d) => new Date(`${d.date}T00:00:00Z`).getUTCDay() === 0);
  const aligned = start === -1 ? recent : recent.slice(start);

  const weeks: ContributionDay[][] = [];
  for (let i = 0; i < aligned.length; i += 7) {
    const chunk = aligned.slice(i, i + 7);
    if (chunk.length < 7) break;
    weeks.push(
      chunk.map((d) => ({
        date: d.date,
        contributionCount: d.count,
        contributionLevel: LEVELS[Math.min(4, Math.max(0, d.level))] ?? "NONE",
      })),
    );
  }
  return weeks;
}
