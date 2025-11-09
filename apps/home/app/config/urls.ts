export type UrlConfig = {
  target: string
  desc: string
  system?: boolean
}

export type Urls = Record<string, string | UrlConfig>

export const urls: Urls = {
  '/ls': { target: '/ls', desc: 'this page', system: true },
  '/ping': { target: '/ping', desc: 'pong', system: true },
  '/health': { target: '/health', desc: 'are you ok?', system: true },
  '/llms.txt': { target: '/llms.txt', desc: 'LLMs.txt', system: true },

  '/': 'https://duyet.net',
  '/ai': { target: 'https://ai.duyet.net', desc: 'AI chatbot' },
  '/blog': 'https://blog.duyet.net',
  '/cv': 'https://cv.duyet.net',
  '/about': { target: '/about', desc: 'about me', system: false },
  '/i': { target: 'https://insights.duyet.net', desc: 'insights' },
  '/insights': {
    target: 'https://insights.duyet.net',
    desc: 'data insights platform',
  },
  '/photos': {
    target: 'https://photos.duyet.net',
    desc: 'photography portfolio',
  },
  '/mcp': {
    target: 'https://mcp.duyet.net',
    desc: 'Model Context Protocol tools',
  },
  '/in': { target: 'https://linkedin.com/in/duyet', desc: 'linkedin' },
  '/rs': {
    target: 'https://rust-tieng-viet.github.io',
    desc: 'Rust Tiếng Việt',
  },
  '/rust': {
    target: 'https://rust-tieng-viet.github.io',
    desc: 'Rust Tiếng Việt',
  },
  '/github': {
    target: 'https://github.com/duyet',
    desc: '@duyet on Github',
  },
  '/monitor': {
    target: 'https://clickhouse-monitoring.vercel.app',
    desc: 'ClickHouse Monitoring UI',
  },
  '/clickhouse': {
    target: 'https://blog.duyet.net/tag/clickhouse',
    desc: 'blog about clickhouse topic',
  },
  '/tiktok': {
    target: 'https://www.tiktok.com/@duyet.net',
    desc: '@duyet.net on tiktok',
  },
  '/tt': {
    target: 'https://www.tiktok.com/@duyet.net',
    desc: 'alias for /tiktok',
  },
  '/un': {
    target: 'https://unsplash.com/@_duyet',
    desc: '@_duyet on unsplash',
  },
  '/x': { target: 'https://x.com/_duyet', desc: '@_duyet on X' },
  '/ni': 'https://www.tiktok.com/@niniluungan',
  '/numi': 'https://numi.app',
  '/ch': {
    target:
      'https://blog.duyet.net/series/clickhouse-on-kubernetes?utm_source=duyet.net&utm_medium=linkedin&utm_campaign=duyet.net',
    desc: 'series about CH',
  },
  '/mo': 'https://monica.im/invitation?c=RJF8T7RT',
  '/api_nini':
    'https://script.google.com/macros/s/AKfycbyRLwRpcBUlE1Iw2mhSN1zQNHLT7EQsnFVPaduKyEUJMQwaBhEuKXJfWjzUZc20F7sR/exec',
  '/api/nini': 'https://duyet.net/api_nini',
}

/**
 * Get the target URL for a given path
 */
export function getTarget(path: string): string | null {
  const entry = urls[path]

  if (!entry) return null

  if (typeof entry === 'string') {
    return entry
  }

  return entry.target
}

/**
 * Get all non-system URLs for display
 */
export function getPublicUrls(): Array<{
  path: string
  target: string
  desc?: string
}> {
  return Object.entries(urls)
    .filter(([_, value]) => {
      if (typeof value === 'string') return true
      return !value.system
    })
    .map(([path, value]) => ({
      path,
      target: typeof value === 'string' ? value : value.target,
      desc: typeof value === 'string' ? undefined : value.desc,
    }))
}
