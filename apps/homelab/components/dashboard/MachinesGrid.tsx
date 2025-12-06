import { nodes } from '@/lib/data'
import { FeaturedMachineCard, MachineCard } from './MachineCard'

/**
 * MachinesGrid Component
 * Displays homelab machines using custom machine cards
 */
export function MachinesGrid() {
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
        {/* Primary Node - Featured Machine Card */}
        {primaryNode && <FeaturedMachineCard node={primaryNode} />}

        {/* Other Nodes - Machine Cards Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {otherNodes.map((node) => (
            <MachineCard key={node.id} node={node} />
          ))}
        </div>
      </div>
    </div>
  )
}
