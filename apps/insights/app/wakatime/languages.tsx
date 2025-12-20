import { DonutChart, LanguageBarChart } from "@/components/charts";
import { getWakaTimeLanguages } from "./wakatime-utils";

export async function WakaTimeLanguages({
  days = 30,
}: {
  days?: number | "all";
}) {
  const languages = await getWakaTimeLanguages(days);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Languages List */}
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-4">
          <h3 className="font-medium">Most Used Languages</h3>
          <p className="text-xs text-muted-foreground">
            Top 8 by usage percentage
          </p>
        </div>
        <LanguageBarChart data={languages} />
      </div>

      {/* Languages Distribution */}
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
            variant="pie"
          />
        </div>
      </div>
    </div>
  );
}
