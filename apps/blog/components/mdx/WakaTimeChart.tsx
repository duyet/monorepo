import * as React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface WakaTimeData {
  date: string;
  coding: number;
  building: number;
  debugging: number;
  reviewing: number;
}

interface WakaTimeChartProps {
  data: WakaTimeData[];
  title?: string;
}

const COLORS = {
  coding: "#3b82f6", // blue-500
  building: "#10b981", // emerald-500
  debugging: "#f59e0b", // amber-500
  reviewing: "#8b5cf6", // violet-500
};

export function WakaTimeChart({ data, title = "Weekly Coding Activity" }: WakaTimeChartProps) {
  return (
    <div className="my-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <h3 className="text-lg font-semibold m-0">{title}</h3>
      </div>
      <div className="p-4">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
              <XAxis
                dataKey="date"
                className="text-xs"
                tick={{ fill: 'currentColor' }}
                tickLine={{ stroke: 'currentColor' }}
                axisLine={{ stroke: 'currentColor' }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: 'currentColor' }}
                tickLine={{ stroke: 'currentColor' }}
                axisLine={{ stroke: 'currentColor' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                }}
                itemStyle={{ fontSize: '12px' }}
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
                dataKey="building"
                stackId="1"
                stroke={COLORS.building}
                fill={COLORS.building}
                fillOpacity={0.6}
                name="Building"
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
                dataKey="reviewing"
                stackId="1"
                stroke={COLORS.reviewing}
                fill={COLORS.reviewing}
                fillOpacity={0.6}
                name="Reviewing"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="text-center">
            <div className="font-semibold">Total Hours</div>
            <div className="text-xl font-bold text-blue-600">
              {data.reduce((sum, d) => sum + d.coding + d.building + d.debugging + d.reviewing, 0).toFixed(1)}
            </div>
          </div>
          <div className="text-center">
            <div className="font-semibold">Avg/Day</div>
            <div className="text-xl font-bold text-emerald-600">
              {(data.reduce((sum, d) => sum + d.coding + d.building + d.debugging + d.reviewing, 0) / data.length).toFixed(1)}
            </div>
          </div>
          <div className="text-center">
            <div className="font-semibold">Peak Day</div>
            <div className="text-xl font-bold text-amber-600">
              {Math.max(...data.map(d => d.coding + d.building + d.debugging + d.reviewing)).toFixed(1)}
            </div>
          </div>
          <div className="text-center">
            <div className="font-semibold">Min Day</div>
            <div className="text-xl font-bold text-violet-600">
              {Math.min(...data.map(d => d.coding + d.building + d.debugging + d.reviewing)).toFixed(1)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}