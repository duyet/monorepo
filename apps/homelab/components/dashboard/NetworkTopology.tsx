'use client'

import { Card } from '@/components/Card'
import { networkTopology } from '@/lib/mockData'
import { Cloud, Globe, Network, Server, Shield } from 'lucide-react'

export function NetworkTopology() {
  const getIcon = (type: string) => {
    switch (type) {
      case 'external':
        return <Globe className="h-6 w-6" />
      case 'gateway':
        return <Network className="h-6 w-6" />
      case 'service':
        return <Shield className="h-6 w-6" />
      case 'node':
        return <Server className="h-6 w-6" />
      default:
        return <Cloud className="h-6 w-6" />
    }
  }

  const getNodeColor = (id: string) => {
    const node = networkTopology.find((n) => n.id === id)
    return node?.color || '#e5e5e5'
  }

  return (
    <Card title="Network Topology">
      <div className="relative">
        {/* Visualization */}
        <div className="flex flex-col items-center gap-8 py-8">
          {/* FPT Internet */}
          <div
            className="flex h-24 w-48 items-center justify-center rounded-2xl text-white shadow-lg"
            style={{ backgroundColor: getNodeColor('fpt') }}
          >
            <div className="text-center">
              {getIcon('external')}
              <p className="mt-2 font-semibold">FPT Internet</p>
              <p className="text-xs opacity-80">ISP Provider</p>
            </div>
          </div>

          {/* Connection line */}
          <div className="h-8 w-0.5 bg-neutral-300 dark:bg-neutral-700" />

          {/* Home Router */}
          <div
            className="flex h-24 w-48 items-center justify-center rounded-2xl text-white shadow-lg"
            style={{ backgroundColor: getNodeColor('router') }}
          >
            <div className="text-center">
              {getIcon('gateway')}
              <p className="mt-2 font-semibold">Home Router</p>
              <p className="text-xs opacity-80">192.168.1.1</p>
            </div>
          </div>

          {/* Connection lines to services and nodes */}
          <div className="relative flex w-full justify-center">
            <div className="absolute left-1/2 top-0 h-8 w-0.5 -translate-x-1/2 bg-neutral-300 dark:bg-neutral-700" />
            <div className="absolute left-0 top-8 h-0.5 w-full bg-neutral-300 dark:bg-neutral-700" />
          </div>

          {/* Services Row */}
          <div className="grid w-full grid-cols-2 gap-8">
            {/* Tailscale */}
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-0.5 bg-neutral-300 dark:bg-neutral-700" />
              <div
                className="flex h-20 w-40 items-center justify-center rounded-xl text-neutral-900 shadow-md"
                style={{ backgroundColor: getNodeColor('tailscale') }}
              >
                <div className="text-center">
                  {getIcon('service')}
                  <p className="mt-1 text-sm font-semibold">Tailscale VPN</p>
                </div>
              </div>
            </div>

            {/* Cloudflare */}
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-0.5 bg-neutral-300 dark:bg-neutral-700" />
              <div
                className="flex h-20 w-40 items-center justify-center rounded-xl text-neutral-900 shadow-md"
                style={{ backgroundColor: getNodeColor('cloudflare') }}
              >
                <div className="text-center">
                  {getIcon('service')}
                  <p className="mt-1 text-sm font-semibold">Cloudflare</p>
                </div>
              </div>
            </div>
          </div>

          {/* Connection line to nodes */}
          <div className="h-8 w-0.5 bg-neutral-300 dark:bg-neutral-700" />

          {/* Minipc Nodes */}
          <div className="grid w-full grid-cols-3 gap-4">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-0.5 bg-neutral-300 dark:bg-neutral-700" />
              <div
                className="flex h-20 w-32 items-center justify-center rounded-xl text-neutral-900 shadow-md"
                style={{ backgroundColor: getNodeColor('minipc-01') }}
              >
                <div className="text-center">
                  {getIcon('node')}
                  <p className="mt-1 text-xs font-semibold">minipc-01</p>
                  <p className="text-xs opacity-60">.101</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-0.5 bg-neutral-300 dark:bg-neutral-700" />
              <div
                className="flex h-20 w-32 items-center justify-center rounded-xl text-neutral-900 shadow-md"
                style={{ backgroundColor: getNodeColor('minipc-02') }}
              >
                <div className="text-center">
                  {getIcon('node')}
                  <p className="mt-1 text-xs font-semibold">minipc-02</p>
                  <p className="text-xs opacity-60">.102</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-0.5 bg-neutral-300 dark:bg-neutral-700" />
              <div
                className="flex h-20 w-32 items-center justify-center rounded-xl text-neutral-900 shadow-md"
                style={{ backgroundColor: getNodeColor('minipc-03') }}
              >
                <div className="text-center">
                  {getIcon('node')}
                  <p className="mt-1 text-xs font-semibold">minipc-03</p>
                  <p className="text-xs opacity-60">.103</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap justify-center gap-4 border-t border-neutral-200 pt-6 text-xs dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#ff6b6b]" />
            <span className="text-muted-foreground">External</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#4dabf7]" />
            <span className="text-muted-foreground">Gateway</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#a8d5ba]" />
            <span className="text-muted-foreground">VPN Service</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#f0d9a8]" />
            <span className="text-muted-foreground">CDN/Tunnel</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#c5c5ff]" />
            <span className="text-muted-foreground">Cluster Nodes</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
