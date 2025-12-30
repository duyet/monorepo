import { BarChart } from "@/components/charts";
import { TokenBarChart } from "@/components/charts/TokenBarChart";
import { getCCUsageActivity, getCCUsageActivityByModel } from "./ccusage-utils";
import type { CCUsageActivityProps } from "./types";

export async function CCUsageActivity({
  days = 30,
  className,
}: CCUsageActivityProps) {
  const [activity, activityByModel] = await Promise.all([
    getCCUsageActivity(days),
    getCCUsageActivityByModel(days),
  ]);

  if (!activity.length) {
    return (
      <div
        className={`rounded-lg border bg-card p-8 text-center ${className || ""}`}
      >
        <p className="text-muted-foreground">No activity data available</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Daily usage activity will appear here once data is available
        </p>
      </div>
    );
  }

  // Get unique model names for categories (exclude 'date')
  const modelNames = Array.from(
    new Set(
      activityByModel.flatMap((d) => Object.keys(d).filter((k) => k !== "date"))
    )
  );

  return (
    <div className={`space-y-6 ${className || ""}`}>
      {/* Token Usage Chart */}
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-4">
          <h3 className="font-medium">Token Usage Trend</h3>
          <p className="text-xs text-muted-foreground">
            Daily Claude Code token usage (in thousands)
          </p>
        </div>
        <TokenBarChart
          categories={["Input Tokens", "Output Tokens", "Cache Tokens"]}
          data={activity}
          index="date"
          stack={true}
          showInThousands={true}
          height={350}
        />
        <div className="mt-3 text-xs text-muted-foreground">
          Data shows tokens in thousands (K). Cache tokens represent prompt
          caching usage.
        </div>
      </div>

      {/* Daily Token Usage by Model Chart */}
      {activityByModel.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <div className="mb-4">
            <h3 className="font-medium">Daily Usage by Model</h3>
            <p className="text-xs text-muted-foreground">
              Daily token consumption breakdown by AI model (in thousands)
            </p>
          </div>
          <BarChart
            categories={modelNames}
            data={activityByModel}
            index="date"
            stack={true}
            legend={true}
            height={400}
          />
          <div className="mt-3 text-xs text-muted-foreground">
            Data shows tokens in thousands (K). Model names are normalized
            for display (e.g., claude-3-5-sonnet → Sonnet 3.5).
          </div>
        </div>
      )}
    </div>
  );
}
