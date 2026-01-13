import React from 'react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaProps,
} from 'recharts';

export interface WakaTimeDataPoint {
  date: string;
  code: number;
  review: number;
  documentation: number;
  meetings: number;
}

export interface WakaTimeChartProps {
  data: WakaTimeDataPoint[];
  title?: string;
  height?: number;
  colors?: {
    code?: string;
    review?: string;
    documentation?: string;
    meetings?: string;
  };
}

const defaultColors = {
  code: '#3b82f6',
  review: '#10b981',
  documentation: '#f59e0b',
  meetings: '#ef4444',
};

/**
 * WakaTimeChart - Recharts stacked area chart for coding activity
 */
export const WakaTimeChart: React.FC<WakaTimeChartProps> = ({
  data,
  title = 'Weekly Coding Activity',
  height = 300,
  colors = defaultColors,
}) => {
  const chartData = data.map((day) => ({
    ...day,
    date: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-lg rounded">
          <p className="font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey}: {entry.value} hrs
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="my-6">
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickMargin={10}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickMargin={10}
              label={{ value: 'Hours', angle: -90, position: 'insideLeft', offset: 10 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="code"
              stackId="1"
              stroke={colors.code}
              fill={colors.code}
              fillOpacity={0.8}
              name="Coding"
            />
            <Area
              type="monotone"
              dataKey="review"
              stackId="1"
              stroke={colors.review}
              fill={colors.review}
              fillOpacity={0.8}
              name="Code Review"
            />
            <Area
              type="monotone"
              dataKey="documentation"
              stackId="1"
              stroke={colors.documentation}
              fill={colors.documentation}
              fillOpacity={0.8}
              name="Documentation"
            />
            <Area
              type="monotone"
              dataKey="meetings"
              stackId="1"
              stroke={colors.meetings}
              fill={colors.meetings}
              fillOpacity={0.8}
              name="Meetings"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};