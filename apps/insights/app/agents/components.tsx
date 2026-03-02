const formatNumber = (num: number) => new Intl.NumberFormat("en-US").format(num);

import { Bot, Cpu, MessageSquare } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Assuming standard Insight KPI cards format
export function AgentKpiCards({ data }: { data: any }) {
  if (!data) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <MessageSquare className="h-4 w-4" />
          <span className="text-sm font-medium">Total Conversations</span>
        </div>
        <p className="text-2xl font-semibold text-foreground">
          {formatNumber(data.globalStats?.total_conversations || 0)}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <Cpu className="h-4 w-4" />
          <span className="text-sm font-medium">Total Messages</span>
        </div>
        <p className="text-2xl font-semibold text-foreground">
          {formatNumber(data.globalStats?.total_messages || 0)}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <Bot className="h-4 w-4" />
          <span className="text-sm font-medium">Active Users (30d)</span>
        </div>
        <p className="text-2xl font-semibold text-foreground">
          {formatNumber(data.activeUsers30d || 0)}
        </p>
      </div>
    </div>
  );
}

export function AgentTrendsChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="text-lg font-medium tracking-tight mb-4">
        Daily Conversation Volume (Fast vs Agent Models)
      </h3>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorFast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorAgent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border)"
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              tickFormatter={(num) => formatNumber(num)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--background)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Area
              type="monotone"
              dataKey="fast"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorFast)"
              stackId="1"
            />
            <Area
              type="monotone"
              dataKey="agent"
              stroke="#06b6d4"
              fillOpacity={1}
              fill="url(#colorAgent)"
              stackId="1"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
