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
    <section id="insights" className="py-20 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Analytics & Insights
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Real-time metrics about my development activity, blog performance, and coding habits
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="bg-gray-50 dark:bg-slate-800 rounded-xl p-6 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                {metric.icon}
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  {metric.trend}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {metric.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {metric.description}
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Recent Activities */}
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg"
                >
                  <div className={`w-2 h-2 rounded-full mt-2 ${activity.color.replace('text-', 'bg-')}`}></div>
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-white font-medium">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technology Focus */}
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Technology Focus
            </h3>
            <div className="space-y-4">
              {[
                { name: 'Rust', percentage: 35, color: 'bg-orange-500' },
                { name: 'TypeScript', percentage: 30, color: 'bg-blue-500' },
                { name: 'Python', percentage: 25, color: 'bg-green-500' },
                { name: 'SQL', percentage: 10, color: 'bg-purple-500' }
              ].map((tech, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-900 dark:text-white font-medium">
                      {tech.name}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {tech.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`${tech.color} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${tech.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* View Full Dashboard Button */}
        <div className="text-center mt-12">
          <Link
            href={process.env.NEXT_PUBLIC_DUYET_INSIGHTS_URL || 'https://insights.duyet.net'}
            target="_blank"
            className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            View Full Dashboard
            <ArrowRightIcon size={16} className="ml-2" />
          </Link>
        </div>
      </div>
    </section>
  )
}