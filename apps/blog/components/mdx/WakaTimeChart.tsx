import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface WakaTimeData {
  date: string;
  coding: number;
  debugging: number;
  documentation: number;
  meetings: number;
}

interface WakaTimeChartProps {
  data: WakaTimeData[];
}

const COLORS = {
  coding: "#3b82f6",     // blue-500
  debugging: "#ef4444",  // red-500
  documentation: "#8b5cf6", // purple-500
  meetings: "#10b981",   // green-500
};

/**
 * WakaTimeChart Component
 * Displays a stacked area chart for coding activity
 */
export const WakaTimeChart: React.FC<WakaTimeChartProps> = ({ data }) => {
  return (
    <div className="w-full mb-8">
      <h3 className="text-2xl font-bold mb-4 text-center">WakaTime Activity</h3>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              }}
              formatter={(value: number, name: string) => [`${value}h`, name]}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="coding"
              stackId="1"
              stroke={COLORS.coding}
              fill={COLORS.coding}
              fillOpacity={0.6}
              name="Coding"
            />
            <Area
              type="monotone"
              dataKey="debugging"
              stackId="1"
              stroke={COLORS.debugging}
              fill={COLORS.debugging}
              fillOpacity={0.6}
              name="Debugging"
            />
            <Area
              type="monotone"
              dataKey="documentation"
              stackId="1"
              stroke={COLORS.documentation}
              fill={COLORS.documentation}
              fillOpacity={0.6}
              name="Documentation"
            />
            <Area
              type="monotone"
              dataKey="meetings"
              stackId="1"
              stroke={COLORS.meetings}
              fill={COLORS.meetings}
              fillOpacity={0.6}
              name="Meetings"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
