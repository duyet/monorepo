'use client'

import React from 'react'
import { Star, CheckCircle, XCircle } from 'lucide-react'

interface Tool {
  name: string
  description: string
  pros: string[]
  cons: string[]
  rating: number
}

interface ToolComparisonProps {
  tools: Tool[]
}

export function ToolComparison({ tools }: ToolComparisonProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Tool Comparison</h2>
        <p className="text-gray-600">Detailed comparison of different tools with ratings</p>
      </div>

      <div className="grid gap-6">
        {tools.map((tool, index) => (
          <div key={index} className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold mb-1">{tool.name}</h3>
                <p className="text-gray-600">{tool.description}</p>
              </div>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < tool.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm font-medium">{tool.rating}/5</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <h4 className="font-semibold text-green-800">Pros</h4>
                </div>
                <ul className="space-y-1">
                  {tool.pros.map((pro, i) => (
                    <li key={i} className="text-sm text-green-700 flex items-start">
                      <span className="mr-2">•</span>
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <XCircle className="w-5 h-5 text-red-600 mr-2" />
                  <h4 className="font-semibold text-red-800">Cons</h4>
                </div>
                <ul className="space-y-1">
                  {tool.cons.map((con, i) => (
                    <li key={i} className="text-sm text-red-700 flex items-start">
                      <span className="mr-2">•</span>
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}