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
      <div className="flex min-h-56 items-center justify-center rounded-xl border border-border bg-card">
        <div className="h-16 w-16 animate-pulse rounded-xl bg-secondary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-56 items-center justify-center rounded-xl border border-border bg-card p-5">
        <p className="text-muted-foreground">
          Failed to load AI code percentage data
        </p>
      </div>
    );
  }

  const { total_lines_added, ai_lines_added, human_lines_added } = data;

  return (
    <div className="grid gap-5 rounded-xl border border-border bg-card p-5 sm:p-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end">
      <div className="space-y-3">
        <div className="text-6xl font-semibold tracking-tight text-foreground sm:text-7xl">
          {displayPercentage.toFixed(1)}%
        </div>
        <div className="text-sm font-medium text-muted-foreground">
          Code written by AI
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-stone-100 p-4 dark:bg-stone-900/60">
          <div className="text-xs text-muted-foreground">Total Lines</div>
          <div className="mt-2 text-xl font-semibold tabular-nums">
            {(total_lines_added / 1000).toFixed(1)}K
          </div>
        </div>

        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-900/40 dark:bg-orange-950/30">
          <div className="text-xs text-orange-700 dark:text-orange-300">
            AI Lines
          </div>
          <div className="mt-2 text-xl font-semibold tabular-nums text-orange-700 dark:text-orange-300">
            {(ai_lines_added / 1000).toFixed(1)}K
          </div>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/40 dark:bg-blue-950/30">
          <div className="text-xs text-blue-700 dark:text-blue-300">
            Human Lines
          </div>
          <div className="mt-2 text-xl font-semibold tabular-nums text-blue-700 dark:text-blue-300">
            {(human_lines_added / 1000).toFixed(1)}K
          </div>
        </div>
      </div>
    </div>
  );
}
