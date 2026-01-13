'use client'

import React, { useState } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

interface Feature {
  name: string
  description?: string
}

interface Tool {
  name: string
  features: Record<string, 'low' | 'medium' | 'high' | 'none'>
}

interface FeatureMatrixProps {
  features: Feature[]
  tools: Tool[]
  description?: string
}

const getScoreColor = (score: 'low' | 'medium' | 'high' | 'none') => {
  switch (score) {
    case 'high':
      return 'bg-green-100 text-green-800 border-green-300'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'low':
      return 'bg-orange-100 text-orange-800 border-orange-300'
    case 'none':
      return 'bg-gray-100 text-gray-500 border-gray-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

const getScoreIcon = (score: 'low' | 'medium' | 'high' | 'none') => {
  switch (score) {
    case 'high':
      return <div className="w-3 h-3 bg-green-500 rounded-full"></div>
    case 'medium':
      return <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
    case 'low':
      return <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
    case 'none':
      return <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
    default:
      return null
  }
}

export function FeatureMatrix({ features, tools, description }: FeatureMatrixProps) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)

  const sortedTools = React.useMemo(() => {
    if (!sortConfig) return tools

    return [...tools].sort((a, b) => {
      const aValue = a.features[sortConfig.key] || 'none'
      const bValue = b.features[sortConfig.key] || 'none'

      const scoreOrder = { 'none': 0, 'low': 1, 'medium': 2, 'high': 3 }
      const aScore = scoreOrder[aValue as keyof typeof scoreOrder]
      const bScore = scoreOrder[bValue as keyof typeof scoreOrder]

      if (aScore < bScore) return sortConfig.direction === 'asc' ? -1 : 1
      if (aScore > bScore) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [tools, sortConfig])

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return <ArrowUpDown className="w-4 h-4 opacity-50" />
    return sortConfig.direction === 'asc'
      ? <ArrowUp className="w-4 h-4" />
      : <ArrowDown className="w-4 h-4" />
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Feature Matrix</h2>
        {description && <p className="text-gray-600">{description}</p>}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                Tool
              </th>
              {features.map((feature, index) => (
                <th
                  key={index}
                  className="border border-gray-300 px-4 py-3 text-center font-semibold cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort(feature.name)}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>{feature.name}</span>
                    {getSortIcon(feature.name)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedTools.map((tool, toolIndex) => (
              <tr key={toolIndex} className={toolIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-gray-300 px-4 py-3 font-medium">
                  {tool.name}
                </td>
                {features.map((feature, featureIndex) => {
                  const score = tool.features[feature.name] || 'none'
                  return (
                    <td key={featureIndex} className="border border-gray-300 px-4 py-3">
                      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${getScoreColor(score)}`}>
                        {getScoreIcon(score)}
                        <span className="capitalize">{score}</span>
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm">High</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span className="text-sm">Medium</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <span className="text-sm">Low</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
          <span className="text-sm">None</span>
        </div>
      </div>
    </div>
  )
}