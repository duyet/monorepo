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
    total_seconds: number
    human_readable_total: string
    human_readable_daily_average: string
    daily_average: number
  }
}

interface WakaTimeSummary {
  data: Array<{
    grand_total: {
      human_readable_total: string
      total_seconds: number
    }
    range: {
      date: string
      start: string
      end: string
    }
  }>
}

const WAKATIME_API_BASE = 'https://wakatime.com/api/v1'

async function wakaTimeRequest(endpoint: string) {
  const apiKey = process.env.WAKATIME_API_KEY

  if (!apiKey) {
    console.warn('WAKATIME_API_KEY not found in environment variables')
    return null
  }

  const headers = new Headers({
    Authorization: `Bearer ${apiKey}`,
  })

  try {
    const res = await fetch(`${WAKATIME_API_BASE}${endpoint}`, {
      headers,
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!res.ok) {
      console.error(`WakaTime API error: ${res.status} ${res.statusText}`)
      return null
    }

    return res.json()
  } catch (error) {
    console.error('WakaTime API request failed:', error)
    return null
  }
}

export async function getWakaTimeStats(): Promise<WakaTimeStats | null> {
  return wakaTimeRequest('/users/current/stats/last_30_days')
}

export async function getWakaTimeSummary(): Promise<WakaTimeSummary | null> {
  return wakaTimeRequest('/users/current/summaries?range=last_30_days')
}

export async function getWakaTimeLanguages() {
  const stats = await getWakaTimeStats()
  if (!stats?.data?.languages) return []
  
  return stats.data.languages.slice(0, 8).map(lang => ({
    name: lang.name,
    percent: Math.round(lang.percent * 100) / 100,
    total_seconds: lang.total_seconds
  }))
}

export async function getWakaTimeActivity() {
  const summary = await getWakaTimeSummary()
  if (!summary?.data) return []
  
  return summary.data.map(day => ({
    range: {
      date: day.range.date
    },
    'Coding Hours': (day.grand_total.total_seconds / 3600).toFixed(1)
  }))
}

export async function getWakaTimeMetrics() {
  const stats = await getWakaTimeStats()
  if (!stats?.data) {
    return {
      totalHours: 0,
      avgDailyHours: 0,
      daysActive: 0,
      topLanguage: 'N/A'
    }
  }

  const { data } = stats
  const totalHours = data.total_seconds / 3600
  const avgDailyHours = data.daily_average / 3600
  const topLanguage = data.languages?.[0]?.name || 'N/A'

  // Calculate active days from summary
  const summary = await getWakaTimeSummary()
  const daysActive = summary?.data?.filter(day => day.grand_total.total_seconds > 0).length || 0

  return {
    totalHours: Math.round(totalHours * 10) / 10,
    avgDailyHours: Math.round(avgDailyHours * 10) / 10,
    daysActive,
    topLanguage
  }
}