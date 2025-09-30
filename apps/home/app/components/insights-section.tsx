import Link from 'next/link'
import { TrendingUpIcon, BarChart3Icon, ActivityIcon, CodeIcon, ArrowRightIcon } from 'lucide-react'

export function InsightsSection() {
  // Mock data - in a real implementation, you might fetch this from your insights API
  const metrics = [
    {
      icon: <BarChart3Icon className="text-blue-600 dark:text-blue-400" size={24} />,
      title: 'Blog Traffic',
      value: '50K+',
      description: 'Monthly page views',
      trend: '+12%'
    },
    {
      icon: <CodeIcon className="text-green-600 dark:text-green-400" size={24} />,
      title: 'Coding Time',
      value: '40+',
      description: 'Hours per week',
      trend: '+5%'
    },
    {
      icon: <ActivityIcon className="text-purple-600 dark:text-purple-400" size={24} />,
      title: 'Open Source',
      value: '100+',
      description: 'GitHub repositories',
      trend: '+8%'
    },
    {
      icon: <TrendingUpIcon className="text-orange-600 dark:text-orange-400" size={24} />,
      title: 'Performance',
      value: '99.9%',
      description: 'System uptime',
      trend: 'Stable'
    }
  ]

  const recentActivities = [
    {
      type: 'blog',
      title: 'Published new post about ClickHouse performance',
      time: '2 days ago',
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      type: 'code',
      title: 'Committed to data-pipeline project',
      time: '1 week ago',
      color: 'text-green-600 dark:text-green-400'
    },
    {
      type: 'talk',
      title: 'Spoke at Data Engineering Meetup',
      time: '2 weeks ago',
      color: 'text-purple-600 dark:text-purple-400'
    }
  ]

  return (
    <section id="insights" className="py-6 px-4 bg-white border-b border-claude-gray-200">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-claude-black">
            Analytics
          </h2>
          <Link
            href={process.env.NEXT_PUBLIC_DUYET_INSIGHTS_URL || 'https://insights.duyet.net'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-claude-copper hover:text-claude-orange transition-colors"
          >
            Full dashboard
            <ArrowRightIcon size={14} className="ml-1" />
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Left: Metrics */}
          <div className="grid grid-cols-4 gap-2">
            {metrics.map((metric, index) => (
              <div key={index} className="text-center p-2 bg-claude-beige rounded-lg border border-claude-tan">
                <div className="text-base font-semibold text-claude-copper">
                  {metric.value}
                </div>
                <div className="text-xs text-claude-gray-600">
                  {metric.title}
                </div>
              </div>
            ))}
          </div>

          {/* Right: Tech Stack */}
          <div className="space-y-2">
            {[
              { name: 'Rust', percentage: 35 },
              { name: 'TypeScript', percentage: 30 },
              { name: 'Python', percentage: 25 },
              { name: 'SQL', percentage: 10 }
            ].map((tech, index) => (
              <div key={index}>
                <div className="flex justify-between mb-0.5">
                  <span className="text-xs font-medium text-claude-gray-800">
                    {tech.name}
                  </span>
                  <span className="text-xs text-claude-gray-600">
                    {tech.percentage}%
                  </span>
                </div>
                <div className="w-full bg-claude-tan rounded-full h-1">
                  <div
                    className="bg-claude-copper h-1 rounded-full transition-all"
                    style={{ width: `${tech.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}