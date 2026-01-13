import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface WakaTimeData {
  date: string;
  hours: number;
}

interface WakaTimeChartProps {
  data: WakaTimeData[];
  title?: string;
  type?: "line" | "area";
  color?: string;
}

/**
 * Line chart visualization for development activity
 */
export const WakaTimeChart: React.FC<WakaTimeChartProps> = ({
  data,
  title = "Development Activity",
  type = "line",
  color = "#3b82f6",
}) => {
  const chartData = data.map((item) => ({
    ...item,
    formattedDate: new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  const ChartComponent = type === "area" ? AreaChart : LineChart;

  return (
    <div className="my-8 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        {title}
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ChartComponent data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.3} />
            <XAxis
              dataKey="formattedDate"
              stroke="#6b7280"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              stroke="#6b7280"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${value}h`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "0.5rem",
                color: "#f3f4f6",
              }}
              formatter={(value) => [`${value} hours`, "Time spent"]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            {type === "area" ? (
              <Area
                type="monotone"
                dataKey="hours"
                stroke={color}
                fill={color}
                fillOpacity={0.2}
                strokeWidth={2}
              />
            ) : (
              <Line
                type="monotone"
                dataKey="hours"
                stroke={color}
                strokeWidth={2}
                dot={{ fill: color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: color }}
              />
            )}
          </ChartComponent>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Total hours: {data.reduce((sum, item) => sum + item.hours, 0).toFixed(1)}
      </div>
    </div>
  );
};

// Example usage component
export const WakaTimeChartExample: React.FC = () => {
  const sampleData = [
    { date: "2024-01-01", hours: 3.5 },
    { date: "2024-01-02", hours: 4.2 },
    { date: "2024-01-03", hours: 2.8 },
    { date: "2024-01-04", hours: 5.1 },
    { date: "2024-01-05", hours: 3.9 },
    { date: "2024-01-06", hours: 6.2 },
    { date: "2024-01-07", hours: 4.5 },
    { date: "2024-01-08", hours: 3.2 },
    { date: "2024-01-09", hours: 5.8 },
    { date: "2024-01-10", hours: 4.1 },
  ];

  return (
    <div className="space-y-6">
      <WakaTimeChart data={sampleData} title="Weekly Development Activity" type="line" />
      <WakaTimeChart data={sampleData} title="Weekly Development Activity (Area)" type="area" />
    </div>
  );
};