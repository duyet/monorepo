import { ClusterOverview } from '@/components/dashboard/ClusterOverview'
import { NetworkStats } from '@/components/dashboard/NetworkStats'
import { NetworkTopology } from '@/components/dashboard/NetworkTopology'
import { ResourceMetrics } from '@/components/dashboard/ResourceMetrics'
import { ServiceDowntime } from '@/components/dashboard/ServiceDowntime'
import { ServicesStatus } from '@/components/dashboard/ServicesStatus'

export const metadata = {
  title: 'Homelab Dashboard | duyet.net',
  description: 'Real-time monitoring dashboard for 3-node minipc cluster',
}

export default function HomelabPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Homelab Dashboard</h1>
        <p className="text-muted-foreground">
          Real-time monitoring for your 3-node minipc cluster
        </p>
      </div>

      {/* Cluster Overview */}
      <ClusterOverview />

      {/* Resource Metrics (CPU & Memory) */}
      <ResourceMetrics />

      {/* Services Status */}
      <ServicesStatus />

      {/* Network Stats */}
      <NetworkStats />

      {/* Service Downtime */}
      <ServiceDowntime />

      {/* Network Topology */}
      <NetworkTopology />

      {/* Last Updated Footer */}
      <div className="border-t pt-4 text-center">
        <p className="text-xs text-muted-foreground">
          Last updated: {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  )
}
