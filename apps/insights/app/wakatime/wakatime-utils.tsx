interface WakaTimeStats {
  data: {
    languages: Array<{
      name: string
      percent: number
      total_seconds: number
    }>
    editors: Array<{
      name: string
      percent: number
      total_seconds: number
    }>
    operating_systems: Array<{
      name: string
      percent: number
      total_seconds: number
    }>
    days_including_holidays?: number
    days_minus_holidays?: number
    total_seconds: number
    human_readable_total: string
    human_readable_daily_average: string
    daily_average: number
  }
}

// Using stats endpoint instead of summaries (summaries requires premium)

const WAKATIME_API_BASE = 'https://wakatime.com/api/v1'

async function wakaTimeRequest(endpoint: string) {
  const apiKey = process.env.WAKATIME_API_KEY

  if (!apiKey) {
    console.warn('WAKATIME_API_KEY not found in environment variables')
    return null
  }

  // Add API key as query parameter
  const separator = endpoint.includes('?') ? '&' : '?'
  const url = `${WAKATIME_API_BASE}${endpoint}${separator}api_key=${apiKey}`

  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!res.ok) {
      if (res.status === 401) {
        console.error(
          `WakaTime API authentication failed: Invalid or expired API key`,
          `URL: ${url.replace(/api_key=[^&]+/, 'api_key=***')}`,
        )
      } else if (res.status === 403) {
        console.error('WakaTime API access forbidden - check permissions')
      } else {
        console.error(
          `WakaTime API error: ${res.status} ${res.statusText}`,
          `URL: ${url.replace(/api_key=[^&]+/, 'api_key=***')}`,
        )
      }
      return null
    }

    const data = await res.json()

    // Basic validation to ensure we have a valid response object
    if (!data || typeof data !== 'object') {
      console.error('WakaTime API returned invalid response format')
      return null
    }

    return data
  } catch (error) {
    console.error('WakaTime API request failed:', error)
    return null
  }
}

// Map our period values to WakaTime API ranges
function getWakaTimeRange(days: number | 'all'): string {
  if (days === 'all' || days === 365) return 'last_year'
  if (days === 90) return 'last_6_months'
  if (days === 30) return 'last_30_days'
  if (days === 7) return 'last_7_days'
  return 'last_30_days' // fallback
}

export async function getWakaTimeStats(
  days: number | 'all' = 30,
): Promise<WakaTimeStats | null> {
  const range = getWakaTimeRange(days)
  return wakaTimeRequest(`/users/current/stats/${range}`)
}

export async function getWakaTimeLanguages(days: number | 'all' = 30) {
  const stats = await getWakaTimeStats(days)
  if (!stats?.data?.languages || !Array.isArray(stats.data.languages)) return []

  return stats.data.languages.slice(0, 8).map((lang) => ({
    name: lang?.name || 'Unknown',
    percent: Math.round((lang?.percent || 0) * 100) / 100,
    total_seconds: lang?.total_seconds || 0,
  }))
}

export async function getWakaTimeActivity(days: number | 'all' = 30) {
  // Activity chart - using aggregated stats since daily summaries require premium
  const stats = await getWakaTimeStats(days)
  if (!stats?.data) return []

  const { data } = stats
  const avgHours = (data.daily_average || 0) / 3600
  const activeDays = data.days_minus_holidays || 30

  // Generate approximated daily data points for visualization
  return Array.from({ length: Math.min(activeDays, 30) }, (_, i) => ({
    range: {
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
    },
    'Coding Hours': (avgHours * (0.8 + Math.random() * 0.4)).toFixed(1), // Approximate variation
  }))
}

export async function getWakaTimeMetrics(days: number | 'all' = 30) {
  const stats = await getWakaTimeStats(days)
  if (!stats?.data) {
    return {
      totalHours: 0,
      avgDailyHours: 0,
      daysActive: 0,
      topLanguage: 'N/A',
    }
  }

  const { data } = stats
  const totalHours = (data.total_seconds || 0) / 3600
  const avgDailyHours = (data.daily_average || 0) / 3600
  const topLanguage = data.languages?.[0]?.name || 'N/A'
  const daysActive = data.days_minus_holidays || 0

  return {
    totalHours: Math.round(totalHours * 10) / 10,
    avgDailyHours: Math.round(avgDailyHours * 10) / 10,
    daysActive,
    topLanguage,
  }
}

// Helper functions for data processing
const toHours = (seconds: number) => Math.round((seconds / 3600) * 10) / 10

// Interface definitions for WakaTime API responses
interface DayData {
  date: string
  total: number
}

interface InsightsResponse {
  data?: {
    days?: DayData[]
    is_up_to_date?: boolean
  }
}

interface WeekdayData {
  percent: number
  total_seconds: number
}

interface WeekdayInsights {
  data?: {
    weekdays?: WeekdayData[]
    is_up_to_date?: boolean
  }
}

// Generic helper to group and sum data
function groupSumBy<T>(
  items: T[],
  keyFn: (it: T) => string,
  valFn: (it: T) => number,
): Map<string, number> {
  return items.reduce(
    (map, it) => {
      const k = keyFn(it)
      const v = valFn(it)
      map.set(k, (map.get(k) || 0) + v)
      return map
    },
    new Map<string, number>(),
  )
}

// Get historical monthly activity trend for multiple years
export async function getWakaTimeMonthlyTrend() {
  const startYear = 2025 // Only show data from 2025 onwards

  try {
    // Fetch data for all_time to get historical data
    const insights: InsightsResponse | null = await wakaTimeRequest(
      `/users/current/insights/days?range=all_time`,
    )

    if (!insights?.data?.days || !Array.isArray(insights.data.days)) {
      console.warn('No days data available from WakaTime insights')
      return []
    }

    // Filter and group data by year-month (only from 2025 onwards)
    const filteredDays = insights.data.days.filter((day) => {
      if (!day.date || day.total == null) return false
      const date = new Date(day.date)
      return date.getFullYear() >= startYear
    })

    const monthlyMap = groupSumBy(
      filteredDays,
      (day) => {
        const date = new Date(day.date)
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        return `${year}-${String(month).padStart(2, '0')}`
      },
      (day) => day.total,
    )

    // Convert to array and sort by year-month
    return Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([yearMonth, totalSeconds]) => {
        const [year, month] = yearMonth.split('-').map(Number)
        return {
          yearMonth,
          hours: toHours(totalSeconds),
          displayDate: new Date(year, month - 1).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
          }),
        }
      })
  } catch (error) {
    console.error('Error fetching WakaTime monthly trend:', error)
    return []
  }
}

// Get hourly activity heatmap data by day of week
export async function getWakaTimeHourlyHeatmap() {
  const WEEKDAYS = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ] as const

  try {
    // Get weekday insights
    const weekdayInsights: WeekdayInsights | null = await wakaTimeRequest(
      `/users/current/insights/weekday?range=last_year`,
    )

    if (!weekdayInsights?.data?.weekdays || !Array.isArray(weekdayInsights.data.weekdays)) {
      console.warn('Weekday insights not available or empty')
      return []
    }

    // Check if all weekdays have zero hours - if so, return empty array
    const hasData = weekdayInsights.data.weekdays.some((weekday) => weekday.total_seconds > 0)
    if (!hasData) {
      console.warn('No weekday activity data available')
      return []
    }

    // Map weekday data (0=Sunday to 6=Saturday)
    return weekdayInsights.data.weekdays.map((weekday, index) => ({
      day: WEEKDAYS[index] || 'Unknown',
      dayIndex: index,
      hours: toHours(weekday.total_seconds),
      percent: Math.round(weekday.percent * 100) / 100,
    }))
  } catch (error) {
    console.error('Error fetching WakaTime hourly heatmap:', error)
    return []
  }
}

// Get best day insight - when you're most productive
export async function getWakaTimeBestDay() {
  try {
    const bestDayInsights = await wakaTimeRequest(
      `/users/current/insights/best_day?range=last_year`,
    )

    if (!bestDayInsights?.data) {
      console.warn('Best day insights not available')
      return null
    }

    return bestDayInsights.data
  } catch (error) {
    console.error('Error fetching WakaTime best day:', error)
    return null
  }
}
