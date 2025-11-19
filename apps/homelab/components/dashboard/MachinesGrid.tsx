import { ContentCard, FeaturedCard } from '@duyet/components'
import { nodes } from '@/lib/mockData'
import type { Node } from '@/lib/mockData/types'

/**
 * MachinesGrid Component
 * Displays homelab machines using FeaturedCard for primary node and ContentCard for others
 */
export function MachinesGrid() {
  const getStatusColor = (
    status: Node['status']
  ): 'terracotta' | 'sage' | 'coral' | 'lavender' => {
    switch (status) {
      case 'online':
        return 'sage'
      case 'offline':
        return 'coral'
      case 'maintenance':
        return 'lavender'
      default:
        return 'terracotta'
    }
  }

  const getStatusBadge = (status: Node['status']) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const [primaryNode, ...otherNodes] = nodes

  return (
    <div className="space-y-4">
      <div>
        <h2 className="mb-2 font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Homelab Machines
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          MicroK8s cluster nodes and their current status
        </p>
      </div>

      <div className="space-y-4">
        {/* Primary Node - Featured Card */}
        {primaryNode && (
          <FeaturedCard
            title={primaryNode.name}
            href={`#${primaryNode.id}`}
            category={getStatusBadge(primaryNode.status)}
            description={`Primary cluster node • IP: ${primaryNode.ip} • Running ${primaryNode.services} services • ${primaryNode.cpu}% CPU • ${primaryNode.memoryUsed}/${primaryNode.memoryTotal}GB RAM • Uptime: ${primaryNode.uptime}`}
            color={getStatusColor(primaryNode.status)}
          />
        )}

        {/* Other Nodes - Content Cards Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {otherNodes.map((node) => (
            <ContentCard
              key={node.id}
              title={node.name}
              href={`#${node.id}`}
              description={`IP: ${node.ip} • Type: ${node.type} • Uptime: ${node.uptime}`}
              color={getStatusColor(node.status)}
              tags={[
                getStatusBadge(node.status),
                `${node.services} services`,
                `${node.cpu}% CPU`,
                `${node.memoryUsed}/${node.memoryTotal}GB RAM`,
              ]}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
