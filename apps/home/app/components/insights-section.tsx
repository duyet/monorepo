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
    <section id="insights" className="py-12 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Analytics & Insights
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Real-time metrics about development activity, blog performance, and coding habits
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Metrics Card */}
          <div className="lg:col-span-2">
            <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Key Metrics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {metrics.map((metric, index) => (
                  <div key={index} className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      {metric.icon}
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      {metric.value}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      {metric.description}
                    </div>
                    <div className="text-xs font-medium text-green-600 dark:text-green-400">
                      {metric.trend}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Technology Focus Card */}
          <div>
            <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Technology Focus
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'Rust', percentage: 35, color: 'bg-orange-500' },
                  { name: 'TypeScript', percentage: 30, color: 'bg-blue-500' },
                  { name: 'Python', percentage: 25, color: 'bg-green-500' },
                  { name: 'SQL', percentage: 10, color: 'bg-purple-500' }
                ].map((tech, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-900 dark:text-white font-medium text-sm">
                        {tech.name}
                      </span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {tech.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className={`${tech.color} h-1.5 rounded-full transition-all duration-300`}
                        style={{ width: `${tech.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities - Compact */}
        <div className="mt-6">
          <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h3>
            <div className="grid md:grid-cols-3 gap-3">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 bg-white dark:bg-slate-700 rounded-lg"
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${activity.color.replace('text-', 'bg-')}`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 dark:text-white font-medium text-sm leading-tight">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* View Full Dashboard Button - Compact */}
        <div className="text-center mt-6">
          <Link
            href={process.env.NEXT_PUBLIC_DUYET_INSIGHTS_URL || 'https://insights.duyet.net'}
            target="_blank"
            className="inline-flex items-center px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
          >
            View Full Dashboard
            <ArrowRightIcon size={14} className="ml-2" />
          </Link>
        </div>
      </div>
    </section>
  )
}