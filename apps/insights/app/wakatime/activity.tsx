import { BarChart } from "@/components/charts";

type ActivityWithAI = Array<{
  date: string;
  "Human Hours": number;
  "AI Hours": number;
}>;
type ActivityTotalOnly = Array<{ date: string; "Total Hours": number }>;
type CodingActivity = ActivityWithAI | ActivityTotalOnly;

export function WakaTimeActivityView({
  codingActivity,
  isAllTime = false,
}: {
  codingActivity: CodingActivity;
  isAllTime?: boolean;
}) {
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
    <div className="rounded-xl p-4">
      <div className="mb-4">
        <h3 className="font-medium text-[#1a1a1a] dark:text-white">{title}</h3>
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
