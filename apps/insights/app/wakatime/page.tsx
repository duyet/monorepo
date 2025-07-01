import { BarChart, BarList, DonutChart } from '@/components/charts'
import { MetricCard } from '@/components/ui/metric-card'
import Image from 'next/image'
import { StaticCard } from '../../components/static-card'
import { TextDataSource } from '../../components/text-data-source'
import { Code, Clock, Zap, Calendar } from 'lucide-react'

export const metadata = {
  title: '@duyet Coding Insights',
  description: 'Coding Insights data collected from Wakatime.',
}

const WAKA_CODING_ACTIVITY_API =
  'https://wakatime.com/share/@duyet/2fe9921d-4bd2-4a6f-87a1-5cc2fcc5a9fc.json'

const WAKA_LANGUAGES_API =
  'https://wakatime.com/share/@duyet/8087c715-c108-487c-87ba-64d545ac95a8.json'

export default async function Wakatime() {
  const codingActivity = await getWakaCodingActivity()
  const languages = await getWakaLanguages()
  const top10Languages = languages.slice(0, 10)
  
  const totalHours = codingActivity.reduce((sum, day) => sum + parseFloat(day['Coding Hours']), 0)
  const avgDailyHours = totalHours / codingActivity.length
  const topLanguage = languages[0]
  const daysActive = codingActivity.filter(day => parseFloat(day['Coding Hours']) > 0).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
              <Code className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Coding Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Programming activity and language statistics
              </p>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Total Hours"
            value={totalHours.toFixed(1)}
            description="Last 30 days"
            icon={<Clock className="h-6 w-6" />}
            change={{ value: 22, label: "vs last month" }}
          />
          <MetricCard
            title="Daily Average"
            value={avgDailyHours.toFixed(1)}
            description="Hours per day"
            icon={<Zap className="h-6 w-6" />}
            change={{ value: 15, label: "vs last month" }}
          />
          <MetricCard
            title="Active Days"
            value={daysActive.toString()}
            description="Days with activity"
            icon={<Calendar className="h-6 w-6" />}
            change={{ value: 8, label: "vs last month" }}
          />
          <MetricCard
            title="Top Language"
            value={topLanguage?.name || 'N/A'}
            description={`${topLanguage?.percent || 0}% of time`}
            icon={<Code className="h-6 w-6" />}
          />
        </div>

        {/* Coding Activity Chart */}
        <div className="rounded-xl border bg-card p-6 shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <span>Daily Coding Activity</span>
          </h2>
          <BarChart
            categories={['Coding Hours']}
            data={codingActivity}
            index="range.date"
          />
          <TextDataSource>Wakatime • Last 30 days</TextDataSource>
        </div>

        {/* Languages Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Languages List */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Code className="h-5 w-5 text-green-600" />
                <span>Programming Languages</span>
              </div>
              <span className="text-sm text-muted-foreground">Usage %</span>
            </h2>
            <BarList
              data={top10Languages.map((language) => ({
                name: language.name,
                value: language.percent,
              }))}
            />
          </div>

          {/* Languages Pie Chart */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Language Distribution</h2>
            <div className="flex justify-center">
              <DonutChart
                category="percent"
                className="w-64 h-64"
                data={languages.slice(0, 8)}
                index="name"
                showLabel
                variant="pie"
              />
            </div>
          </div>
        </div>

        {/* Activity Calendar */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            <span>Yearly Activity Calendar</span>
          </h2>
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
            source="Wakatime (Last Year)"
            title="Coding Activity Heatmap"
            url={{
              light: 'https://wakatime.com/share/@duyet/bf2b1851-7d8f-4c32-9033-f0ac18362d9e.svg',
              dark: 'https://wakatime.com/share/@duyet/b7b8389a-04ba-402f-9095-b1748a5be49c.svg',
            }}
          />
        </div>

        <TextDataSource>Wakatime Analytics • All time data</TextDataSource>
      </div>
    </div>
  )
}

interface WakaCodingActivity {
  data: {
    range: {
      start: string
      end: string
      date: string
      text: string
      timezone: string
    }
    grand_total: {
      hours: number
      minutes: number
      total_seconds: number
      digital: string
      text: string
    }
  }[]
}

async function getWakaCodingActivity() {
  const raw = await fetch(WAKA_CODING_ACTIVITY_API)
  const data = ((await raw.json()) as WakaCodingActivity).data

  return data.map((item) => ({
    ...item,
    'Coding Hours': (item.grand_total.total_seconds / 3600).toFixed(1),
  }))
}

interface WakaLanguages {
  data: {
    name: string
    percent: number
    color: string
  }[]
}
async function getWakaLanguages() {
  const raw = await fetch(WAKA_LANGUAGES_API)
  const data = ((await raw.json()) as WakaLanguages).data

  return data
}
