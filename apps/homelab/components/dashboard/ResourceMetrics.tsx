'use client'

import { Card } from '@/components/Card'
import { cpuHistory, memoryHistory } from '@/lib/mockData'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export function ResourceMetrics() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* CPU Usage */}
      <Card title="CPU Usage - Last 24 Hours">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={cpuHistory}>
            <defs>
              <linearGradient id="cpu1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c5c5ff" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#c5c5ff" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="cpu2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a8d5ba" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#a8d5ba" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="cpu3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f0d9a8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#f0d9a8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 12 }}
              stroke="currentColor"
              opacity={0.5}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke="currentColor"
              opacity={0.5}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Area
              type="monotone"
              dataKey="minipc-01"
              stroke="#9090ff"
              fillOpacity={1}
              fill="url(#cpu1)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="minipc-02"
              stroke="#76c893"
              fillOpacity={1}
              fill="url(#cpu2)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="minipc-03"
              stroke="#ffc857"
              fillOpacity={1}
              fill="url(#cpu3)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-4 flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#c5c5ff]" />
            <span className="text-muted-foreground">minipc-01</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#a8d5ba]" />
            <span className="text-muted-foreground">minipc-02</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#f0d9a8]" />
            <span className="text-muted-foreground">minipc-03</span>
          </div>
        </div>
      </Card>

      {/* Memory Usage */}
      <Card title="Memory Usage - Last 24 Hours">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={memoryHistory}>
            <defs>
              <linearGradient id="mem1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c5c5ff" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#c5c5ff" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="mem2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a8d5ba" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#a8d5ba" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="mem3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f0d9a8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#f0d9a8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 12 }}
              stroke="currentColor"
              opacity={0.5}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke="currentColor"
              opacity={0.5}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Area
              type="monotone"
              dataKey="minipc-01"
              stroke="#9090ff"
              fillOpacity={1}
              fill="url(#mem1)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="minipc-02"
              stroke="#76c893"
              fillOpacity={1}
              fill="url(#mem2)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="minipc-03"
              stroke="#ffc857"
              fillOpacity={1}
              fill="url(#mem3)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-4 flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#c5c5ff]" />
            <span className="text-muted-foreground">minipc-01</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#a8d5ba]" />
            <span className="text-muted-foreground">minipc-02</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#f0d9a8]" />
            <span className="text-muted-foreground">minipc-03</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
