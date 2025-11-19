/**
 * Utility functions for mock data generation
 */

import { UPTIME_RANGES } from '../constants'

/**
 * Generate a random value within a range
 */
export const random = (min: number, max: number): number =>
  Math.random() * (max - min) + min

/**
 * Generate a realistic uptime string (e.g., "25d 14h 32m")
 */
export const generateUptime = (): string => {
  const days = Math.floor(
    random(UPTIME_RANGES.DAYS.min, UPTIME_RANGES.DAYS.max)
  )
  const hours = Math.floor(
    random(UPTIME_RANGES.HOURS.min, UPTIME_RANGES.HOURS.max)
  )
  const minutes = Math.floor(
    random(UPTIME_RANGES.MINUTES.min, UPTIME_RANGES.MINUTES.max)
  )
  return `${days}d ${hours}h ${minutes}m`
}

/**
 * Get a timestamp for historical data X hours ago
 */
export const getHistoricalTime = (hoursAgo: number): string => {
  const d = new Date()
  d.setHours(d.getHours() - hoursAgo)
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}
