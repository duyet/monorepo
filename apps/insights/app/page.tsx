import { Cloudflare } from './blog/cloudflare'
import { PostHog } from './blog/posthog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart2, Globe, Code, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: '@duyet Insights Dashboard',
  description: 'Analytics and insights for duyet.net - Web traffic, coding activity, and performance metrics.',
}

export default function InsightsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
              <BarChart2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Insights Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Analytics and performance metrics for duyet.net
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="traffic" className="flex items-center space-x-2">
              <Globe className="h-4 w-4" />
              <span>Traffic</span>
            </TabsTrigger>
            <TabsTrigger value="coding" className="flex items-center space-x-2">
              <Code className="h-4 w-4" />
              <span>Coding</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid gap-6">
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  <span>Website Analytics</span>
                </h2>
                <Cloudflare />
              </div>
              
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Popular Content</span>
                </h2>
                <PostHog />
              </div>
            </div>
          </TabsContent>

          {/* Traffic Tab */}
          <TabsContent value="traffic" className="space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <Cloudflare />
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <PostHog />
            </div>
          </TabsContent>

          {/* Coding Tab */}
          <TabsContent value="coding" className="space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="text-center py-12">
                <Code className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Coding Activity</h3>
                <p className="text-muted-foreground mb-4">
                  View detailed coding insights and language statistics
                </p>
                <Link 
                  href="/wakatime" 
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  View Coding Dashboard
                </Link>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Data updates automatically • Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  )
}