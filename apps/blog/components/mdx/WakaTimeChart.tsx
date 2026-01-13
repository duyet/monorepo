import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface WakaTimeData {
  date: string;
  coding: number;
  meeting: number;
  planning: number;
  documentation: number;
  "other": number;
}

interface WakaTimeChartProps {
  data: WakaTimeData[];
  title?: string;
  height?: number;
}

export function WakaTimeChart({ data, title = "Coding Activity", height = 300 }: WakaTimeChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value} hrs
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="my-6">
      {title && <h3 className="text-2xl font-bold mb-4">{title}</h3>}
      <div className="w-full">
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="coding"
              stackId="1"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.6}
              name="Coding"
            />
            <Area
              type="monotone"
              dataKey="documentation"
              stackId="1"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.6}
              name="Documentation"
            />
            <Area
              type="monotone"
              dataKey="meeting"
              stackId="1"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.6}
              name="Meeting"
            />
            <Area
              type="monotone"
              dataKey="planning"
              stackId="1"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.6}
              name="Planning"
            />
            <Area
              type="monotone"
              dataKey="other"
              stackId="1"
              stroke="#f59e0b"
              fill="#f59e0b"
              fillOpacity={0.6}
              name="Other"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}