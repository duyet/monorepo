import { AreaChart } from "@/components/charts";
import { getWakaTimeMonthlyTrend } from "./wakatime-utils";

export async function WakaTimeMonthlyTrend() {
  const monthlyData = await getWakaTimeMonthlyTrend();

  if (!monthlyData || monthlyData.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-4">
          <h3 className="font-medium">Monthly Activity Trend</h3>
          <p className="text-xs text-muted-foreground">
            Long-term coding activity over the years
          </p>
        </div>
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <p>No historical data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-4">
        <h3 className="font-medium">Monthly Activity Trend</h3>
        <p className="text-xs text-muted-foreground">
          Coding activity month by month over the last{" "}
          {Math.ceil(monthlyData.length / 12)} years
        </p>
      </div>
      <AreaChart
        categories={["Monthly Hours"]}
        data={monthlyData.map((item) => ({
          yearMonth: item.yearMonth,
          "Monthly Hours": item.hours,
        }))}
        index="yearMonth"
        showGridLines={true}
      />
    </div>
  );
}
