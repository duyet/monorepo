import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface WakaTimeData {
  date: string;
  [key: string]: number | string;
}

interface WakaTimeChartProps {
  data: WakaTimeData[];
  colors?: string[];
  title?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-lg">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.value}h
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function WakaTimeChart({
  data,
  colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088FE"],
  title = "Development Time Distribution",
}: WakaTimeChartProps) {
  // Get all unique keys from data (excluding 'date')
  const keys = data.length > 0
    ? Object.keys(data[0]).filter(k => k !== "date")
    : [];

  return (
    <div className="my-6">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
      )}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="date" stroke="currentColor" className="text-xs" />
            <YAxis stroke="currentColor" className="text-xs" unit="h" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {keys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stackId="1"
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={0.6}
                name={key}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
        Stacked area chart showing development time distribution over the period
      </div>
    </div>
  );
}