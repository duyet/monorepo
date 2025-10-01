import { CompactMetric } from '@/components/ui/CompactMetric'
import { Calendar, Clock, Code, Zap } from 'lucide-react'
import { getWakaTimeMetrics } from './wakatime-utils'

export async function WakaTimeMetrics({ days = 30 }: { days?: number | 'all' }) {
  const metrics = await getWakaTimeMetrics(days)

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <CompactMetric
        label="Total Hours"
        value={metrics.totalHours.toFixed(1)}
        icon={<Clock className="h-4 w-4" />}
        change={metrics.totalHours > 0 ? { value: 22 } : undefined}
      />
      <CompactMetric
        label="Daily Average"
        value={metrics.avgDailyHours.toFixed(1)}
        icon={<Zap className="h-4 w-4" />}
        change={metrics.avgDailyHours > 0 ? { value: 15 } : undefined}
      />
      <CompactMetric
        label="Active Days"
        value={metrics.daysActive.toString()}
        icon={<Calendar className="h-4 w-4" />}
        change={metrics.daysActive > 0 ? { value: 8 } : undefined}
      />
      <CompactMetric
        label="Top Language"
        value={metrics.topLanguage}
        icon={<Code className="h-4 w-4" />}
      />
    </div>
  )
}
