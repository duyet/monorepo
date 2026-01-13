import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface WakaTimeData {
  date: string;
  coding: number;
  reviewing: number;
  debugging: number;
  other: number;
}

interface WakaTimeChartProps {
  data: WakaTimeData[];
  height?: number;
  title?: string;
}

export function WakaTimeChart({ data, height = 300, title }: WakaTimeChartProps) {
  const colors = {
    coding: "#3b82f6", // blue
    reviewing: "#10b981", // green
    debugging: "#f59e0b", // amber
    other: "#6b7280", // gray
  };

  return (
    <div className="my-6">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
      )}
      <div style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                color: "white",
                borderRadius: "8px",
              }}
              formatter={(value: number, name: string) => [
                `${value.toFixed(1)}h`,
                name.charAt(0).toUpperCase() + name.slice(1),
              ]}
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
              dataKey="reviewing"
              stackId="1"
              stroke={colors.reviewing}
              fill={colors.reviewing}
              fillOpacity={0.6}
              name="Reviewing"
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
              dataKey="other"
              stackId="1"
              stroke={colors.other}
              fill={colors.other}
              fillOpacity={0.6}
              name="Other"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}