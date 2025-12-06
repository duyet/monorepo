import { cn } from '@duyet/libs/utils'
import type { Node } from '@/lib/data/types'

interface MachineCardProps {
  node: Node
  className?: string
}

const statusColors = {
  online: {
    bg: 'bg-sage-light',
    badge: 'bg-sage text-white',
  },
  offline: {
    bg: 'bg-coral-light',
    badge: 'bg-coral text-white',
  },
  degraded: {
    bg: 'bg-lavender-light',
    badge: 'bg-lavender text-white',
  },
  maintenance: {
    bg: 'bg-terracotta-light',
    badge: 'bg-terracotta text-white',
  },
}

function StatusBadge({ status }: { status: Node['status'] }) {
  const colors = statusColors[status] || statusColors.maintenance
  return (
    <span
      className={cn(
        'rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide',
        colors.badge
      )}
    >
      {status}
    </span>
  )
}

function MetricTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md bg-white/60 px-2 py-1 text-xs font-medium text-neutral-700">
      {children}
    </span>
  )
}

/**
 * FeaturedMachineCard - Large card for primary/featured node
 */
export function FeaturedMachineCard({ node, className }: MachineCardProps) {
  const colors = statusColors[node.status] || statusColors.maintenance

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-6 md:p-8',
        colors.bg,
        className
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <StatusBadge status={node.status} />
        </div>

        <h3 className="font-serif text-3xl font-bold text-neutral-900 md:text-4xl">
          {node.name}
        </h3>

        <p className="text-base text-neutral-700">
          Primary cluster node &bull; IP: {node.ip} &bull; Running{' '}
          {node.services} services &bull; {node.cpu}% CPU &bull;{' '}
          {node.memoryUsed}/{node.memoryTotal}GB RAM &bull; Uptime:{' '}
          {node.uptime}
        </p>
      </div>
    </div>
  )
}

/**
 * MachineCard - Standard card for secondary nodes
 */
export function MachineCard({ node, className }: MachineCardProps) {
  const colors = statusColors[node.status] || statusColors.maintenance

  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-2xl p-5',
        colors.bg,
        className
      )}
    >
      <div className="flex flex-col gap-2">
        <h3 className="font-serif text-xl font-bold text-neutral-900">
          {node.name}
        </h3>
        <p className="text-sm text-neutral-600">
          IP: {node.ip} &bull; Type: {node.type} &bull; Uptime: {node.uptime}
        </p>
      </div>

      <div className="mt-auto flex flex-wrap gap-2">
        <MetricTag>{node.status === 'online' ? 'Online' : node.status === 'offline' ? 'Offline' : node.status.charAt(0).toUpperCase() + node.status.slice(1)}</MetricTag>
        <MetricTag>{node.services} services</MetricTag>
        <MetricTag>{node.cpu}% CPU</MetricTag>
        <MetricTag>
          {node.memoryUsed}/{node.memoryTotal}GB RAM
        </MetricTag>
      </div>
    </div>
  )
}
