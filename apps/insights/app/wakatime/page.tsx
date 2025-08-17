import { BarChart, LanguageBarChart, DonutChart } from '@/components/charts'
import { CompactMetric } from '@/components/ui/compact-metric'
import Image from 'next/image'
import { StaticCard } from '../../components/static-card'
import { Code, Clock, Zap, Calendar } from 'lucide-react'

export const metadata = {
  title: 'WakaTime Coding Analytics @duyet',
  description: 'Programming activity, language statistics, and coding insights from WakaTime',
}


// Static generation only
export const dynamic = 'force-static'

export default function Wakatime() {
  // Using static placeholder data for static generation
  const codingActivity: { range: { date: string }; 'Coding Hours': string }[] = []
  const languages: { name: string; percent: number }[] = []
  
  const totalHours = 0
  const avgDailyHours = 0
  const daysActive = 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b pb-6">
        <h1 className="text-2xl font-bold tracking-tight">Coding Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Programming activity and language statistics from WakaTime
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Coding Metrics */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Coding Overview</h2>
            <p className="text-sm text-muted-foreground">Programming activity summary for the last 30 days</p>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <CompactMetric
              label="Total Hours"
              value={totalHours.toFixed(1)}
              icon={<Clock className="h-4 w-4" />}
              change={totalHours > 0 ? { value: 22 } : undefined}
            />
            <CompactMetric
              label="Daily Average"
              value={avgDailyHours.toFixed(1)}
              icon={<Zap className="h-4 w-4" />}
              change={avgDailyHours > 0 ? { value: 15 } : undefined}
            />
            <CompactMetric
              label="Active Days"
              value={daysActive.toString()}
              icon={<Calendar className="h-4 w-4" />}
              change={daysActive > 0 ? { value: 8 } : undefined}
            />
            <CompactMetric
              label="Top Language"
              value="N/A"
              icon={<Code className="h-4 w-4" />}
            />
          </div>
        </div>

        {/* Coding Activity */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Daily Activity</h2>
            <p className="text-sm text-muted-foreground">Coding hours over the last 30 days</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="mb-4">
              <h3 className="font-medium">Coding Hours Trend</h3>
              <p className="text-xs text-muted-foreground">Daily programming activity</p>
            </div>
            <BarChart
              categories={['Coding Hours']}
              data={codingActivity}
              index="range.date"
            />
          </div>
        </div>

        {/* Programming Languages */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Programming Languages</h2>
            <p className="text-sm text-muted-foreground">Language usage and distribution</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Languages List */}
            <div className="rounded-lg border bg-card p-4">
              <div className="mb-4">
                <h3 className="font-medium">Most Used Languages</h3>
                <p className="text-xs text-muted-foreground">Top 8 by usage percentage</p>
              </div>
              <LanguageBarChart data={languages} />
            </div>

            {/* Languages Distribution */}
            <div className="rounded-lg border bg-card p-4">
              <div className="mb-4">
                <h3 className="font-medium">Language Distribution</h3>
                <p className="text-xs text-muted-foreground">Visual breakdown by usage</p>
              </div>
              <div className="flex justify-center">
                <DonutChart
                  category="percent"
                  data={languages.slice(0, 8)}
                  index="name"
                  showLabel
                  variant="pie"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Activity Calendar */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Yearly Activity</h2>
            <p className="text-sm text-muted-foreground">Annual coding activity heatmap</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <StaticCard
              extra={
                <Image
                  alt="Wakatime Badge"
                  className="mt-3"
                  height={30}
                  src="https://wakatime.com/badge/user/8d67d3f3-1ae6-4b1e-a8a1-32c57b3e05f9.svg"
                  unoptimized
                  width={200}
                />
              }
              source="WakaTime (Last Year)"
              title="Coding Activity Heatmap"
              url={{
                light: 'https://wakatime.com/share/@duyet/bf2b1851-7d8f-4c32-9033-f0ac18362d9e.svg',
                dark: 'https://wakatime.com/share/@duyet/b7b8389a-04ba-402f-9095-b1748a5be49c.svg',
              }}
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Data from WakaTime • Updated daily
        </p>
      </div>
    </div>
  )
}

