import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { formatNumber } from "@duyet/libs";
import { getCurrentAICodePercentage } from "../lib/queries";

/**
 * One line-count tile.
 *
 * The three tiles were inline `{(x / 1000).toFixed(1)}K` expressions, which
 * had two consequences beyond the repetition. A repo with fewer than 1,000
 * lines rendered `0.5K` (or `0.0K` at zero) rather than the actual count, and
 * a million-line repo rendered `1234.6K` — the `k` tier had no upper bound, so
 * the number grew without ever switching to `m`.
 */
function LineCountTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "blue" | "orange" | "emerald";
}) {
  const tones = {
    blue: "bg-blue-100 dark:bg-blue-950/40",
    orange: "bg-orange-100 dark:bg-orange-950/40",
    emerald: "bg-emerald-100 dark:bg-emerald-950/40",
  } as const;

  return (
    <div className={`rounded-xl p-4 ${tones[tone]}`}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-2 text-xl font-semibold tabular-nums">
        {formatNumber(value)}
      </div>
    </div>
  );
}

export function AIPercentageHero() {
  const { data, error, isLoading } = useSWR("ai-percentage-current", () =>
    getCurrentAICodePercentage()
  );

  const [displayPercentage, setDisplayPercentage] = useState(0);
  // The count-up needs the value it is animating away from. Keeping it in a ref
  // takes it out of the effect's deps on purpose: listing `displayPercentage`
  // there re-runs the effect on every frame, so each frame re-arms a fresh 1s
  // animation and one rAF chain keeps running long after the count-up is over.
  const startPercentageRef = useRef(0);

  useEffect(() => {
    const target = data?.ai_percentage;
    if (target == null) return;

    const duration = 1000;
    const start = startPercentageRef.current;
    const startTime = performance.now();
    let raf = 0;

    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      // Land exactly on the target rather than on `start + (target - start)`,
      // which is not bit-identical in floating point.
      const next = progress >= 1 ? target : start + (target - start) * progress;
      startPercentageRef.current = next;
      setDisplayPercentage(next);

      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      }
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [data?.ai_percentage]);

  if (isLoading) {
    return (
      <div className="flex min-h-56 items-center justify-center rounded-xl border bg-card p-5">
        <div className="h-16 w-16 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-56 items-center justify-center rounded-xl border bg-card p-5">
        <p className="text-muted-foreground">
          Failed to load AI code percentage data
        </p>
      </div>
    );
  }

  const { total_lines_added, ai_lines_added, human_lines_added } = data;

  return (
    <div className="grid gap-5 rounded-xl border bg-card p-5 sm:p-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end">
      <div className="space-y-3">
        <div className="text-6xl font-semibold tracking-tight sm:text-7xl">
          {displayPercentage.toFixed(1)}%
        </div>
        <div className="text-sm font-medium text-muted-foreground">
          Code written by AI
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <LineCountTile
          label="Total Lines"
          value={total_lines_added}
          tone="blue"
        />
        <LineCountTile label="AI Lines" value={ai_lines_added} tone="orange" />
        <LineCountTile
          label="Human Lines"
          value={human_lines_added}
          tone="emerald"
        />
      </div>
    </div>
  );
}
