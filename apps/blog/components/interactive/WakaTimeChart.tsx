import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, Bar, ComposedChart } from "recharts";

export interface WakaTimeData {
  date: string;
  coding: number;
  debugging: number;
  reviewing: number;
  other: number;
}

export interface WakaTimeChartProps {
  title?: string;
  data: WakaTimeData[];
  height?: number;
}

/**
 * WakaTimeChart - Recharts stacked area chart
 * Displays coding activity over time with stacked areas for different activities
 */
export function WakaTimeChart({ title = "Coding Activity", data, height = 350 }: WakaTimeChartProps) {
  const colors = {
    coding: "#3b82f6",    // blue
    debugging: "#ef4444", // red
    reviewing: "#8b5cf6", // purple
    other: "#6b7280",     // gray
  };

  return (
    <div className="my-6">
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
            <XAxis dataKey="date" stroke="currentColor" className="text-xs" />
            <YAxis stroke="currentColor" className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0,0,0,0.8)",
                color: "white",
                borderRadius: "8px",
                border: "none",
              }}
              itemStyle={{ fontSize: "12px" }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="coding"
              stackId="1"
              stroke={colors.coding}
              fill={colors.coding}
              fillOpacity={0.6}
              name="Coding"
            />
            <Area
              type="monotone"
              dataKey="debugging"
              stackId="1"
              stroke={colors.debugging}
              fill={colors.debugging}
              fillOpacity={0.6}
              name="Debugging"
            />
            <Area
              type="monotone"
              dataKey="reviewing"
              stackId="1"
              stroke={colors.reviewing}
              fill={colors.reviewing}
              fillOpacity={0.6}
              name="Reviewing"
            />
            <Area
              type="monotone"
              dataKey="other"
              stackId="1"
              stroke={colors.other}
              fill={colors.other}
              fillOpacity={0.6}
              name="Other"
            />
            <Bar dataKey="coding" stackId="1" fill={colors.coding} opacity={0.3} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p>Daily coding breakdown showing time distribution across activities.</p>
      </div>
    </div>
  );
}

export const sampleWakaTimeData: WakaTimeData[] = [
  { date: "Mon", coding: 4.5, debugging: 1.2, reviewing: 0.8, other: 0.5 },
  { date: "Tue", coding: 5.2, debugging: 1.8, reviewing: 1.0, other: 0.3 },
  { date: "Wed", coding: 3.8, debugging: 0.9, reviewing: 1.5, other: 0.7 },
  { date: "Thu", coding: 6.1, debugging: 2.1, reviewing: 0.5, other: 0.4 },
  { date: "Fri", coding: 4.3, debugging: 1.5, reviewing: 1.2, other: 0.6 },
  { date: "Sat", coding: 2.5, debugging: 0.5, reviewing: 0.3, other: 0.2 },
  { date: "Sun", coding: 1.8, debugging: 0.3, reviewing: 0.2, other: 0.4 },
];