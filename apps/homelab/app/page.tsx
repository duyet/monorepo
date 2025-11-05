import { ClusterOverview } from '@/components/dashboard/ClusterOverview'
import { ClusterTopology } from '@/components/dashboard/ClusterTopology'
import { NetworkStats } from '@/components/dashboard/NetworkStats'
import { ResourceMetrics } from '@/components/dashboard/ResourceMetrics'
import { ServiceDowntime } from '@/components/dashboard/ServiceDowntime'
import { ServicesStatus } from '@/components/dashboard/ServicesStatus'

export const metadata = {
  title: 'Homelab Dashboard | duyet.net',
  description: 'Real-time monitoring dashboard for microk8s cluster',
}

export default function HomelabPage() {
  return (
    <div className="space-y-8">
      {/* Cluster Topology */}
      <ClusterTopology />

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

      {/* Last Updated Footer */}
      <div className="border-t pt-4 text-center">
        <p className="text-xs text-muted-foreground">
          Last updated: {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  )
}
