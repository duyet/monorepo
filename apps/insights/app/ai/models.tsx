import { DonutChart, LanguageBarChart } from "@/components/charts";
import { getCCUsageModels } from "./ccusage-utils";
import type { CCUsageModelsProps, ModelChartData } from "./types";

export async function CCUsageModels({
  days = 30,
  className,
}: CCUsageModelsProps) {
  const models = await getCCUsageModels(days);

  // Transform model data for charts (converted from hook to regular functions)
  const tokenChartData: ModelChartData[] = models.map((model) => ({
    name: model.name,
    percent: model.percent,
  }));

  const costChartData: ModelChartData[] = models.map((model) => ({
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
        <div className="flex justify-center">
          <DonutChart
            category="percent"
            data={costChartData.slice(0, 8)} // Top 8 for better visibility
            index="name"
            showLabel
            variant="pie"
          />
        </div>
      </div>
    </div>
  );
}
