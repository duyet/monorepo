import { LanguageBarChart } from "@/components/charts";
import { getCCUsageModels } from "./ccusage-utils";
import type { CCUsageModelsProps, ModelChartData } from "./types";

export async function CCUsageModels({
  days = 30,
  className,
}: CCUsageModelsProps) {
  const models = await getCCUsageModels(days);

  // Transform model data for charts (converted from hook to regular functions)
  // Both charts use the same set of models for data consistency
  // LanguageBarChart internally limits to top 8, which ensures both charts show identical models
  const tokenChartData: ModelChartData[] = models.map((model) => ({
    name: model.name,
    percent: model.percent,
  }));

  // Cost chart uses same models, sorted by cost percentage for better readability
  // Using bar chart (same as token chart) ensures models with 0% cost are still visible
  const costChartData: ModelChartData[] = [...models]
    .sort((a, b) => b.costPercent - a.costPercent)
    .map((model) => ({
      name: model.name,
      percent: model.costPercent,
    }));

  if (!models.length) {
    return (
      <div
        className={`rounded-lg border bg-card p-8 text-center ${className || ""}`}
      >
        <p className="text-muted-foreground">No model data available</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Model usage distribution will appear here once data is available
        </p>
      </div>
    );
  }

  return (
    <div className={`grid gap-6 lg:grid-cols-2 ${className || ""}`}>
      {/* Token Usage Distribution */}
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-4">
          <h3 className="font-medium">Token Usage by Model</h3>
          <p className="text-xs text-muted-foreground">
            Percentages based on total token consumption
          </p>
        </div>
        <LanguageBarChart data={tokenChartData} />
      </div>

      {/* Cost Distribution */}
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-4">
          <h3 className="font-medium">Cost Distribution by Model</h3>
          <p className="text-xs text-muted-foreground">
            Percentages based on total spending
          </p>
        </div>
        <LanguageBarChart data={costChartData} />
      </div>
    </div>
  );
}
