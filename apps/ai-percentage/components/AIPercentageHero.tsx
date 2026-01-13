import useSWR from "swr";
import { useEffect, useState } from "react";
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
  }, [data?.ai_percentage]);

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <div className="h-24 w-24 animate-pulse rounded-full bg-purple-100 dark:bg-purple-900/20" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <p className="text-muted-foreground">
          Failed to load AI code percentage data
        </p>
      </div>
    );
  }

  const {
    _ai_percentage,
    total_lines_added,
    ai_lines_added,
    human_lines_added,
  } = data;

  return (
    <div className="space-y-8 text-center py-12">
      <div className="space-y-4">
        <div className="text-8xl font-bold text-purple-600 dark:text-purple-400">
          {displayPercentage.toFixed(1)}%
        </div>
        <div className="text-xl text-muted-foreground">Code written by AI</div>
      </div>

      <div className="grid grid-cols-3 gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">Total Lines</div>
          <div className="text-2xl font-semibold">
            {(total_lines_added / 1000).toFixed(1)}K
          </div>
        </div>

        <div className="rounded-lg border bg-purple-50 p-4 dark:bg-purple-900/20">
          <div className="text-sm text-purple-700 dark:text-purple-300">
            AI Lines
          </div>
          <div className="text-2xl font-semibold text-purple-600 dark:text-purple-400">
            {(ai_lines_added / 1000).toFixed(1)}K
          </div>
        </div>

        <div className="rounded-lg border bg-blue-50 p-4 dark:bg-blue-900/20">
          <div className="text-sm text-blue-700 dark:text-blue-300">
            Human Lines
          </div>
          <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
            {(human_lines_added / 1000).toFixed(1)}K
          </div>
        </div>
      </div>
    </div>
  );
}
