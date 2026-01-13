"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface WakaTimeData {
  date: string;
  coding: number;
  reviewing: number;
  debugging: number;
}

interface WakaTimeChartProps {
  data: WakaTimeData[];
  height?: number;
}

export function WakaTimeChart({ data, height = 300 }: WakaTimeChartProps) {
  return (
    <div className="my-6">
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-semibold">
        WakaTime Activity - Stacked Area Chart
      </div>
      <div style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="date" fontSize={12} tickMargin={8} />
            <YAxis fontSize={12} tickMargin={8} label={{ value: "Hours", angle: -90, position: "insideLeft" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0,0,0,0.8)",
                border: "none",
                borderRadius: "8px",
                color: "white",
              }}
              formatter={(value: number | undefined) => [(value ?? 0).toFixed(2) + "h", ""]}
            />
            <Area
              type="monotone"
              dataKey="coding"
              stackId="1"
              stroke="#3b82f6"
              fill="#60a5fa"
              name="Coding"
            />
            <Area
              type="monotone"
              dataKey="reviewing"
              stackId="1"
              stroke="#10b981"
              fill="#34d399"
              name="Reviewing"
            />
            <Area
              type="monotone"
              dataKey="debugging"
              stackId="1"
              stroke="#f59e0b"
              fill="#fbbf24"
              name="Debugging"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex gap-3 text-xs flex-wrap">
        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-500 rounded-full"></span> Coding</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Reviewing</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-yellow-500 rounded-full"></span> Debugging</span>
      </div>
    </div>
  );
}