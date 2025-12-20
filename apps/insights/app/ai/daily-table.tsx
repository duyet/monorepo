import { getCCUsageActivityRaw } from "./ccusage-utils";
import type { CCUsageActivityProps } from "./types";

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toFixed(0);
}

function formatCurrency(amount: number): string {
  if (amount === 0) return "$0.00";
  if (amount < 0.01) return "<$0.01";
  return `$${amount.toFixed(2)}`;
}

interface BarCellProps {
  value: number;
  max: number;
  label: string;
  color?: string;
}

function BarCell({
  value,
  max,
  label,
  color = "var(--chart-1)",
}: BarCellProps) {
  const percentage = max > 0 ? (value / max) * 100 : 0;

  return (
    <div className="relative min-w-[100px]">
      <div className="absolute inset-0 flex items-center justify-end">
        <div
          className="h-6 rounded-sm transition-all"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <div className="relative px-3 py-1 text-right font-medium">{label}</div>
    </div>
  );
}

export async function CCUsageDailyTable({
  days = 30,
  className,
}: CCUsageActivityProps) {
  const activity = await getCCUsageActivityRaw(days);

  if (!activity.length) {
    return (
      <div
        className={`rounded-lg border bg-card p-8 text-center ${className || ""}`}
      >
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Group by month for 12-month view (365 days) and all-time view
  const shouldGroupByMonth = days === 365 || days === "all";
  let sortedActivity: Array<{
    date: string;
    "Input Tokens": number;
    "Output Tokens": number;
    "Cache Tokens": number;
    "Total Cost": number;
  }>;

  if (shouldGroupByMonth) {
    // Group data by month (YYYY-MM)
    const monthlyData = activity.reduce(
      (acc, row) => {
        // Extract year-month from date (e.g., "2024-01-15" -> "2024-01")
        const month = row.date.substring(0, 7);

        if (!acc[month]) {
          acc[month] = {
            date: month,
            "Input Tokens": 0,
            "Output Tokens": 0,
            "Cache Tokens": 0,
            "Total Cost": 0,
          };
        }

        acc[month]["Input Tokens"] += row["Input Tokens"] || 0;
        acc[month]["Output Tokens"] += row["Output Tokens"] || 0;
        acc[month]["Cache Tokens"] += row["Cache Tokens"] || 0;
        acc[month]["Total Cost"] += row["Total Cost"] || 0;

        return acc;
      },
      {} as Record<
        string,
        {
          date: string;
          "Input Tokens": number;
          "Output Tokens": number;
          "Cache Tokens": number;
          "Total Cost": number;
        }
      >
    );

    // Convert to array and sort by month (most recent first)
    sortedActivity = Object.values(monthlyData).sort((a, b) =>
      b.date.localeCompare(a.date)
    );
  } else {
    // Keep daily view for other date ranges
    // Reverse to show most recent first
    sortedActivity = [...activity].reverse();
  }

  // Calculate max values for bar scaling
  const maxInput = Math.max(
    ...sortedActivity.map((row) => row["Input Tokens"] || 0)
  );
  const maxOutput = Math.max(
    ...sortedActivity.map((row) => row["Output Tokens"] || 0)
  );
  const maxCache = Math.max(
    ...sortedActivity.map((row) => row["Cache Tokens"] || 0)
  );
  const maxTotal = Math.max(
    ...sortedActivity.map(
      (row) =>
        (row["Input Tokens"] || 0) +
        (row["Output Tokens"] || 0) +
        (row["Cache Tokens"] || 0)
    )
  );
  const maxCost = Math.max(
    ...sortedActivity.map((row) => row["Total Cost"] || 0)
  );

  return (
    <div className={`rounded-lg border bg-card ${className || ""}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="whitespace-nowrap px-4 py-3 text-left font-medium">
                {shouldGroupByMonth ? "Month" : "Date"}
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left font-medium">
                Input Tokens
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left font-medium">
                Output Tokens
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left font-medium">
                Cache Tokens
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left font-medium">
                Total Tokens
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left font-medium">
                Cost
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedActivity.map((row, index) => {
              const inputTokens = row["Input Tokens"] || 0;
              const outputTokens = row["Output Tokens"] || 0;
              const cacheTokens = row["Cache Tokens"] || 0;
              const totalTokens = inputTokens + outputTokens + cacheTokens;
              const totalCost = row["Total Cost"] || 0;

              return (
                <tr
                  key={row.date}
                  className={`hover:bg-muted/50 border-b transition-colors last:border-0 ${index % 2 === 0 ? "bg-muted/20" : ""}`}
                >
                  <td className="whitespace-nowrap px-4 py-2 font-medium">
                    {row.date}
                  </td>
                  <td className="px-4 py-2">
                    <BarCell
                      value={inputTokens}
                      max={maxInput}
                      label={formatNumber(inputTokens)}
                      color="var(--chart-1)"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <BarCell
                      value={outputTokens}
                      max={maxOutput}
                      label={formatNumber(outputTokens)}
                      color="var(--chart-2)"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <BarCell
                      value={cacheTokens}
                      max={maxCache}
                      label={formatNumber(cacheTokens)}
                      color="var(--chart-3)"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <BarCell
                      value={totalTokens}
                      max={maxTotal}
                      label={formatNumber(totalTokens)}
                      color="var(--chart-4)"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <BarCell
                      value={totalCost}
                      max={maxCost}
                      label={formatCurrency(totalCost)}
                      color="var(--chart-5)"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-muted/50 border-t font-semibold">
            <tr>
              <td className="whitespace-nowrap px-4 py-3">Total</td>
              <td className="px-4 py-3">
                {formatNumber(
                  sortedActivity.reduce(
                    (sum, row) => sum + (row["Input Tokens"] || 0),
                    0
                  )
                )}
              </td>
              <td className="px-4 py-3">
                {formatNumber(
                  sortedActivity.reduce(
                    (sum, row) => sum + (row["Output Tokens"] || 0),
                    0
                  )
                )}
              </td>
              <td className="px-4 py-3">
                {formatNumber(
                  sortedActivity.reduce(
                    (sum, row) => sum + (row["Cache Tokens"] || 0),
                    0
                  )
                )}
              </td>
              <td className="px-4 py-3">
                {formatNumber(
                  sortedActivity.reduce((sum, row) => {
                    const total =
                      (row["Input Tokens"] || 0) +
                      (row["Output Tokens"] || 0) +
                      (row["Cache Tokens"] || 0);
                    return sum + total;
                  }, 0)
                )}
              </td>
              <td className="px-4 py-3">
                {formatCurrency(
                  sortedActivity.reduce(
                    (sum, row) => sum + (row["Total Cost"] || 0),
                    0
                  )
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
