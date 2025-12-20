import { BarChart } from "@/components/charts";
import { getWakaTimeActivityWithAI } from "./wakatime-utils";

export async function WakaTimeActivity({
  days = 30,
}: {
  days?: number | "all";
}) {
  const codingActivity = await getWakaTimeActivityWithAI(days);

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-4">
        <h3 className="font-medium">Coding Hours Trend</h3>
        <p className="text-xs text-muted-foreground">
          Daily programming activity
        </p>
      </div>
      <BarChart
        categories={["Human Hours", "AI Hours"]}
        data={codingActivity}
        index="date"
      />
    </div>
  );
}
