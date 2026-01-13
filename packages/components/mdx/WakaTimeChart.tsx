import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { cn } from "@duyet/libs/utils";

export interface WakaTimeData {
  date: string;
  coding: number;
  building: number;
  debugging: number;
  reviewing: number;
}

export interface WakaTimeChartProps {
  data: WakaTimeData[];
  title?: string;
  className?: string;
}

const COLORS = {
  coding: "#3b82f6", // blue-500
  building: "#22c55e", // green-500
  debugging: "#f59e0b", // amber-500
  reviewing: "#a855f7", // purple-500
};

export function WakaTimeChart({ data, title = "Coding Activity", className }: WakaTimeChartProps) {
  const totalHours = data.reduce((acc, day) => {
    return acc + day.coding + day.building + day.debugging + day.reviewing;
  }, 0);

  const avgHours = totalHours / data.length;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-slate-900/95 border rounded-lg p-3 shadow-lg backdrop-blur-sm">
          <div className="font-semibold mb-2">{label}</div>
          {payload.map((entry: any) => (
            <div key={entry.name} className="text-sm flex items-center justify-between">
              <span className="flex items-center">
                <span
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}
              </span>
              <span className="font-mono ml-4">
                {entry.value.toFixed(1)}h
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn("w-full max-w-5xl mx-auto space-y-6", className)}>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">{title}</h2>
          <p className="text-muted-foreground">
            Total tracked time: {totalHours.toFixed(1)}h · Average: {avgHours.toFixed(1)}h/day
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(COLORS).map(([key, color]) => (
            <div key={key} className="flex items-center space-x-1 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              <span className="capitalize text-muted-foreground">{key}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              {Object.entries(COLORS).map(([key, color]) => (
                <linearGradient key={key} id={`fill${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid strokeDasharray="3 3" className="opacity-50" />

            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickCount={data.length > 14 ? 7 : data.length}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              label={{
                value: "Hours",
                angle: -90,
                position: "insideLeft",
                style: { textAnchor: "middle" },
              }}
            />

            <Tooltip content={<CustomTooltip />} />

            <Legend
              verticalAlign="top"
              height={36}
              wrapperStyle={{ paddingTop: "8px" }}
            />

            <Area
              type="monotone"
              dataKey="coding"
              stackId="1"
              stroke={COLORS.coding}
              fill={`url(#fillcoding)`}
              name="Coding"
            />
            <Area
              type="monotone"
              dataKey="building"
              stackId="1"
              stroke={COLORS.building}
              fill={`url(#fillbuilding)`}
              name="Building"
            />
            <Area
              type="monotone"
              dataKey="debugging"
              stackId="1"
              stroke={COLORS.debugging}
              fill={`url(#filldebugging)`}
              name="Debugging"
            />
            <Area
              type="monotone"
              dataKey="reviewing"
              stackId="1"
              stroke={COLORS.reviewing}
              fill={`url(#fillreviewing)`}
              name="Reviewing"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <div className="font-semibold">Total Days</div>
          <div className="text-2xl font-bold mt-1">{data.length}</div>
        </div>
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <div className="font-semibold">Peak Day</div>
          <div className="text-2xl font-bold mt-1">
            {Math.max(...data.map(d => d.coding + d.building + d.debugging + d.reviewing)).toFixed(1)}h
          </div>
        </div>
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <div className="font-semibold">Best Day</div>
          <div className="text-2xl font-bold mt-1">
            {data.reduce((best, day) => {
              const dayTotal = day.coding + day.building + day.debugging + day.reviewing;
              return dayTotal > best ? dayTotal : best;
            }, 0).toFixed(1)}h
          </div>
        </div>
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <div className="font-semibold">Avg/Day</div>
          <div className="text-2xl font-bold mt-1">
            {totalHours / data.length > 0 ? (totalHours / data.length).toFixed(1) : 0}h
          </div>
        </div>
      </div>
    </div>
  );
}