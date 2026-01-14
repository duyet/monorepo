import { BarChart } from "@/components/charts";
import {
  getWakaTimeActivityWithAI,
  getWakaTimeMonthlyActivity,
} from "./wakatime-utils";

type ActivityWithAI = Array<{
  date: string;
  "Human Hours": number;
  "AI Hours": number;
}>;
type ActivityTotalOnly = Array<{ date: string; "Total Hours": number }>;

export async function WakaTimeActivity({
  days = 30,
}: {
  days?: number | "all";
}) {
  // Use monthly grouped data for "all" period
  const isAllTime = days === "all";
  const codingActivity = isAllTime
    ? await getWakaTimeMonthlyActivity()
    : await getWakaTimeActivityWithAI(days);

  // Detect data format to determine if we have AI breakdown
  const hasAIBreakdown =
    codingActivity.length > 0 && "Human Hours" in codingActivity[0];
  const categories = hasAIBreakdown
    ? ["Human Hours", "AI Hours"]
    : ["Total Hours"];

  // Adjust title and description based on period
  const title = "Coding Trend";
  const description = isAllTime
    ? "Monthly programming activity"
    : "Daily programming activity";

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-4">
        <h3 className="font-medium">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <BarChart
        categories={categories}
        data={codingActivity}
        index="date"
        stack={hasAIBreakdown}
        legend={true}
      />
    </div>
  );
}
