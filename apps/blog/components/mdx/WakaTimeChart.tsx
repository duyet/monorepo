"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { cn } from "@duyet/libs/utils";

export interface WakaTimeData {
  date: string;
  frontend: number;
  backend: number;
  database: number;
  testing: number;
  other: number;
}

export interface WakaTimeChartProps {
  data: WakaTimeData[];
  className?: string;
}

export function WakaTimeChart({ data, className }: WakaTimeChartProps) {
  return (
    <div className={cn("w-full max-w-5xl mx-auto py-6", className)}>
      <h2 className="text-2xl font-bold mb-6">Weekly Coding Activity</h2>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-96">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="date" />
            <YAxis label={{ value: "Hours", angle: -90, position: "insideLeft" }} />
            <Tooltip />
            <Legend />

            <Area
              type="monotone"
              dataKey="frontend"
              stackId="1"
              stroke="#3b82f6"
              fill="#60a5fa"
              name="Frontend"
            />
            <Area
              type="monotone"
              dataKey="backend"
              stackId="1"
              stroke="#10b981"
              fill="#34d399"
              name="Backend"
            />
            <Area
              type="monotone"
              dataKey="database"
              stackId="1"
              stroke="#f59e0b"
              fill="#fbbf24"
              name="Database"
            />
            <Area
              type="monotone"
              dataKey="testing"
              stackId="1"
              stroke="#8b5cf6"
              fill="#a78bfa"
              name="Testing"
            />
            <Area
              type="monotone"
              dataKey="other"
              stackId="1"
              stroke="#6b7280"
              fill="#9ca3af"
              name="Other"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
        {[
          { key: "frontend", label: "Frontend", color: "bg-blue-500" },
          { key: "backend", label: "Backend", color: "bg-green-500" },
          { key: "database", label: "Database", color: "bg-yellow-500" },
          { key: "testing", label: "Testing", color: "bg-purple-500" },
          { key: "other", label: "Other", color: "bg-gray-500" },
        ].map((stat) => {
          const total = data.reduce((sum, item) => sum + (item[stat.key as keyof WakaTimeData] as number), 0);
          return (
            <div key={stat.key} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className={cn("w-3 h-3 rounded-full mb-2", stat.color)} />
              <div className="text-2xl font-bold text-gray-900">{total.toFixed(1)}h</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}