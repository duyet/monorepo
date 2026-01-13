import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface WakaTimeData {
  date: string;
  hours: number;
}

interface WakaTimeChartProps {
  title: string;
  data: WakaTimeData[];
  color?: string;
}

/**
 * WakaTimeChart - Recharts stacked area chart for coding activity
 */
export const WakaTimeChart: React.FC<WakaTimeChartProps> = ({
  title,
  data,
  color = "#3b82f6"
}) => {
  const formatTooltip = (value: number, name: string, props: any) => {
    const hours = Math.round(value * 10) / 10;
    return [`${hours}h`, "Coding Time"];
  };

  const formatXAxis = (tickItem: string) => {
    const date = new Date(tickItem);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="my-6">
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={color} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tickFormatter={formatXAxis}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${value}h`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "0.375rem",
              }}
              formatter={formatTooltip}
            />
            <Area
              type="monotone"
              dataKey="hours"
              stroke={color}
              fillOpacity={1}
              fill="url(#colorHours)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Sample data for demonstration
export const sampleWakaTimeData: WakaTimeData[] = [
  { date: "2024-01-01", hours: 3.5 },
  { date: "2024-01-02", hours: 2.8 },
  { date: "2024-01-03", hours: 4.2 },
  { date: "2024-01-04", hours: 1.9 },
  { date: "2024-01-05", hours: 3.7 },
  { date: "2024-01-06", hours: 2.5 },
  { date: "2024-01-07", hours: 4.8 },
  { date: "2024-01-08", hours: 3.2 },
  { date: "2024-01-09", hours: 2.9 },
  { date: "2024-01-10", hours: 3.6 },
  { date: "2024-01-11", hours: 4.1 },
  { date: "2024-01-12", hours: 2.7 },
  { date: "2024-01-13", hours: 3.8 },
  { date: "2024-01-14", hours: 3.3 },
];

export default WakaTimeChart;