'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface WakaTimeData {
  date: string;
  coding: number;
  reviewing: number;
  debugging: number;
  meetings: number;
}

interface WakaTimeChartProps {
  data: WakaTimeData[];
  height?: number;
}

const COLORS = {
  coding: '#3b82f6',
  reviewing: '#8b5cf6',
  debugging: '#ef4444',
  meetings: '#10b981',
};

export function WakaTimeChart({ data, height = 300 }: WakaTimeChartProps) {
  return (
    <div className="my-6" style={{ height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="date" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" unit="h" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
            }}
            formatter={(value: number) => [`${value.toFixed(1)}h`]}
          />
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
            dataKey="reviewing"
            stackId="1"
            stroke={COLORS.reviewing}
            fill={COLORS.reviewing}
            fillOpacity={0.6}
            name="Reviewing"
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
  );
}