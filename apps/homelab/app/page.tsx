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
  const snapshotDate = new Date().toLocaleString()

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

      {/* Orchestration and Info Footer */}
      <div className="space-y-2 border-t pt-4">
        <p className="text-xs text-neutral-600 dark:text-neutral-400">
          <span className="font-medium">Orchestration:</span> microk8s
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-500">
          This is not a realtime dashboard. Snapshot taken at {snapshotDate}
        </p>
      </div>
    </div>
  )
}
