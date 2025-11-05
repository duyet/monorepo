'use client'

import { Card } from '@/components/Card'
import { networkTraffic, speedTest } from '@/lib/mockData'
import { ArrowDown, ArrowUp, Gauge } from 'lucide-react'
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
      {/* Speedtest Results */}
      <Card title="Internet Speed Test">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-gradient-to-br from-claude-mint to-white p-4 dark:from-green-900/20 dark:to-neutral-900">
            <div className="flex items-center gap-2">
              <ArrowDown className="h-4 w-4 text-green-600 dark:text-green-400" />
              <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                Download
              </p>
            </div>
            <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              {speedTest.download}
            </p>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Mbps</p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-claude-coral to-white p-4 dark:from-red-900/20 dark:to-neutral-900">
            <div className="flex items-center gap-2">
              <ArrowUp className="h-4 w-4 text-red-600 dark:text-red-400" />
              <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                Upload
              </p>
            </div>
            <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              {speedTest.upload}
            </p>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Mbps</p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-claude-lavender to-white p-4 dark:from-purple-900/20 dark:to-neutral-900">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Ping</p>
            </div>
            <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              {speedTest.ping}
            </p>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">ms</p>
          </div>
        </div>
        <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">
          Last test: {speedTest.timestamp} (via speedtest-cli)
        </p>
      </Card>

      {/* Current Traffic Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-3xl bg-gradient-to-br from-claude-sky to-white p-6 dark:from-blue-900/20 dark:to-neutral-900">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ArrowDown className="h-4 w-4 text-blue-500" />
                <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                  Incoming
                </p>
              </div>
              <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {currentTraffic.in}
              </p>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">MB/s</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-claude-coral to-white p-6 dark:from-red-900/20 dark:to-neutral-900">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ArrowUp className="h-4 w-4 text-red-500" />
                <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                  Outgoing
                </p>
              </div>
              <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {currentTraffic.out}
              </p>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">MB/s</p>
            </div>
          </div>
        </div>
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
