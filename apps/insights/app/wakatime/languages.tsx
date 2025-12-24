import { DonutChart } from "@/components/charts";
import { getWakaTimeLanguages } from "./wakatime-utils";

export async function WakaTimeLanguages({
  days = 30,
}: {
  days?: number | "all";
}) {
  const languages = await getWakaTimeLanguages(days);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Language Distribution - Pie Chart */}
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-4">
          <h3 className="font-medium">Language Breakdown</h3>
          <p className="text-xs text-muted-foreground">
            Full pie view of usage distribution
          </p>
        </div>
        <div className="flex justify-center">
          <DonutChart
            category="percent"
            data={languages.slice(0, 8)}
            index="name"
            showLabel
            variant="pie"
          />
        </div>
      </div>

      {/* Language Distribution - Donut Chart */}
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-4">
          <h3 className="font-medium">Language Distribution</h3>
          <p className="text-xs text-muted-foreground">
            Visual breakdown by usage
          </p>
        </div>
        <div className="flex justify-center">
          <DonutChart
            category="percent"
            data={languages.slice(0, 8)}
            index="name"
            showLabel
            variant="donut"
          />
        </div>
      </div>
    </div>
  );
}
