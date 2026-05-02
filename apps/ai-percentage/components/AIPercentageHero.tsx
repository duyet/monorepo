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
      <div className="flex min-h-56 items-center justify-center rounded-xl bg-white shadow-[0_1px_0_rgba(0,0,0,0.08),0_22px_60px_rgba(0,0,0,0.06)] dark:bg-[#171815]">
        <div className="h-16 w-16 animate-pulse rounded-xl bg-[#eeeee5] dark:bg-[#242420]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-56 items-center justify-center rounded-xl bg-white p-5 dark:bg-[#171815]">
        <p className="text-[#686862] dark:text-[#b7b7aa]">
          Failed to load AI code percentage data
        </p>
      </div>
    );
  }

  const { total_lines_added, ai_lines_added, human_lines_added } = data;

  return (
    <div className="grid gap-5 rounded-xl bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.08),0_22px_60px_rgba(0,0,0,0.06)] dark:bg-[#171815] sm:p-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end">
      <div className="space-y-3">
        <div className="text-6xl font-semibold tracking-tight text-[#1a1a1a] dark:text-[#f8f8f2] sm:text-7xl">
          {displayPercentage.toFixed(1)}%
        </div>
        <div className="text-sm font-medium text-[#686862] dark:text-[#b7b7aa]">
          Code written by AI
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-[#cfe2f3] p-4 text-[#1a1a1a]">
          <div className="text-xs text-black/60">Total Lines</div>
          <div className="mt-2 text-xl font-semibold tabular-nums">
            {(total_lines_added / 1000).toFixed(1)}K
          </div>
        </div>

        <div className="rounded-xl bg-[#fde3bf] p-4 text-[#1a1a1a]">
          <div className="text-xs text-black/60">AI Lines</div>
          <div className="mt-2 text-xl font-semibold tabular-nums">
            {(ai_lines_added / 1000).toFixed(1)}K
          </div>
        </div>

        <div className="rounded-xl bg-[#b8efd2] p-4 text-[#1a1a1a]">
          <div className="text-xs text-black/60">Human Lines</div>
          <div className="mt-2 text-xl font-semibold tabular-nums">
            {(human_lines_added / 1000).toFixed(1)}K
          </div>
        </div>
      </div>
    </div>
  );
}
