'use client'

import { Card } from '@/components/Card'
import { networkTraffic } from '@/lib/mockData'
import { ArrowDown, ArrowUp } from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export function NetworkStats() {
  const currentTraffic = networkTraffic[networkTraffic.length - 1]

  return (
    <div className="space-y-6">
      {/* Current Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card padding="sm" className="bg-gradient-to-br from-claude-sky to-white dark:from-blue-900/20 dark:to-neutral-900">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ArrowDown className="h-4 w-4 text-blue-500" />
                <p className="text-xs font-medium text-muted-foreground">Incoming</p>
              </div>
              <p className="mt-2 text-3xl font-bold">{currentTraffic.in}</p>
              <p className="mt-1 text-sm text-muted-foreground">MB/s</p>
            </div>
          </div>
        </Card>

        <Card padding="sm" className="bg-gradient-to-br from-claude-coral to-white dark:from-red-900/20 dark:to-neutral-900">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ArrowUp className="h-4 w-4 text-red-500" />
                <p className="text-xs font-medium text-muted-foreground">Outgoing</p>
              </div>
              <p className="mt-2 text-3xl font-bold">{currentTraffic.out}</p>
              <p className="mt-1 text-sm text-muted-foreground">MB/s</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Network Traffic Chart */}
      <Card title="Network Traffic - Last 24 Hours">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={networkTraffic}>
            <defs>
              <linearGradient id="inbound" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#b3d9ff" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#b3d9ff" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="outbound" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff9999" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ff9999" stopOpacity={0} />
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
              label={{ value: 'MB/s', angle: -90, position: 'insideLeft', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value: number) => [`${value} MB/s`]}
            />
            <Area
              type="monotone"
              dataKey="in"
              stroke="#4dabf7"
              fillOpacity={1}
              fill="url(#inbound)"
              strokeWidth={2}
              name="Incoming"
            />
            <Area
              type="monotone"
              dataKey="out"
              stroke="#ff6b6b"
              fillOpacity={1}
              fill="url(#outbound)"
              strokeWidth={2}
              name="Outgoing"
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-4 flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#b3d9ff]" />
            <span className="text-muted-foreground">Incoming</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#ff9999]" />
            <span className="text-muted-foreground">Outgoing</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
