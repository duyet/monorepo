'use client'

import React from 'react'
import { Calendar, ExternalLink, Github } from 'lucide-react'
import { motion } from 'framer-motion'

interface TimelineEvent {
  date: string
  title: string
  description: string
  icon?: 'release' | 'update' | 'milestone'
  link?: string
  github?: string
}

interface ToolTimelineProps {
  events: TimelineEvent[]
  orientation?: 'horizontal' | 'vertical'
  title?: string
  description?: string
}

const getEventIcon = (type: 'release' | 'update' | 'milestone') => {
  switch (type) {
    case 'release':
      return <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
    case 'update':
      return <div className="w-4 h-4 bg-green-500 rounded-full"></div>
    case 'milestone':
      return <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
    default:
      return <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
  }
}

const getEventColor = (type: 'release' | 'update' | 'milestone') => {
  switch (type) {
    case 'release':
      return 'border-blue-200 bg-blue-50'
    case 'update':
      return 'border-green-200 bg-green-50'
    case 'milestone':
      return 'border-purple-200 bg-purple-50'
    default:
      return 'border-gray-200 bg-gray-50'
  }
}

export function ToolTimeline({ events, orientation = 'vertical', title, description }: ToolTimelineProps) {
  const sortedEvents = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (orientation === 'horizontal') {
    return (
      <div className="space-y-6">
        {title && (
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">{title}</h2>
            {description && <p className="text-gray-600">{description}</p>}
          </div>
        )}

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 transform -translate-y-1/2"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
            {sortedEvents.map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-6 rounded-lg border ${getEventColor(event.icon || 'release')}`}
              >
                {/* Timeline dot */}
                <div className="absolute -top-2 -left-2 bg-white p-2 rounded-full shadow-md z-10">
                  {getEventIcon(event.icon || 'release')}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(event.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>

                  <h3 className="text-lg font-semibold">{event.title}</h3>
                  <p className="text-gray-700">{event.description}</p>

                  <div className="flex space-x-2">
                    {event.link && (
                      <a
                        href={event.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Learn more</span>
                      </a>
                    )}
                    {event.github && (
                      <a
                        href={event.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-gray-600 hover:text-gray-800 text-sm"
                      >
                        <Github className="w-4 h-4" />
                        <span>GitHub</span>
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Vertical timeline
  return (
    <div className="space-y-8">
      {title && (
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          {description && <p className="text-gray-600">{description}</p>}
        </div>
      )}

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-1 bg-gray-200"></div>

        <div className="space-y-8">
          {sortedEvents.map((event, index) => (
            <div key={index} className="relative flex">
              {/* Timeline dot */}
              <div className="absolute left-4 top-0 bg-white p-2 rounded-full shadow-md z-10">
                {getEventIcon(event.icon || 'release')}
              </div>

              {/* Event content */}
              <div className="ml-16 flex-1">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 rounded-lg border ${getEventColor(event.icon || 'release')}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2 sm:mb-0">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(event.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</span>
                    </div>
                    <div className="flex space-x-2">
                      {event.link && (
                        <a
                          href={event.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Learn more</span>
                        </a>
                      )}
                      {event.github && (
                        <a
                          href={event.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-gray-600 hover:text-gray-800 text-sm"
                        >
                          <Github className="w-4 h-4" />
                          <span>GitHub</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                  <p className="text-gray-700">{event.description}</p>
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}