import { useEffect, useState } from "react";
import useSWR from "swr";
import { getCurrentAICodePercentage } from "../lib/queries";

export function AIPercentageHero() {
  const { data, error, isLoading } = useSWR("ai-percentage-current", () =>
    getCurrentAICodePercentage()
  );

  const [displayPercentage, setDisplayPercentage] = useState(0);

  useEffect(() => {
    if (data?.ai_percentage) {
      const target = data.ai_percentage;
      const start = displayPercentage;
      const duration = 1000;
      const startTime = performance.now();

      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        setDisplayPercentage(start + (target - start) * progress);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [data?.ai_percentage, displayPercentage]);

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
        <div className="rounded-xl bg-blue-100 p-4 dark:bg-blue-950/40">
          <div className="text-xs text-muted-foreground">
            Total Lines
          </div>
          <div className="mt-2 text-xl font-semibold tabular-nums">
            {(total_lines_added / 1000).toFixed(1)}K
          </div>
        </div>

        <div className="rounded-xl bg-orange-100 p-4 dark:bg-orange-950/40">
          <div className="text-xs text-muted-foreground">
            AI Lines
          </div>
          <div className="mt-2 text-xl font-semibold tabular-nums">
            {(ai_lines_added / 1000).toFixed(1)}K
          </div>
        </div>

        <div className="rounded-xl bg-emerald-100 p-4 dark:bg-emerald-950/40">
          <div className="text-xs text-muted-foreground">
            Human Lines
          </div>
          <div className="mt-2 text-xl font-semibold tabular-nums">
            {(human_lines_added / 1000).toFixed(1)}K
          </div>
        </div>
      </div>
    </div>
  );
}
