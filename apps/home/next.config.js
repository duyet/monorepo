/**
 * @type {import('next').NextConfig}
 */
const config = {
  transpilePackages: ['@duyet/components', '@duyet/libs'],
  images: {
    dangerouslyAllowSVG: true,
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/blog',
        destination: 'https://blog.duyet.net',
        permanent: false,
      },
      {
        source: '/cv',
        destination: 'https://cv.duyet.net',
        permanent: false,
      },
      {
        source: '/about',
        destination: 'https://blog.duyet.net/about',
        permanent: false,
      },
      {
        source: '/i',
        destination: 'https://insights.duyet.net',
        permanent: false,
      },
      {
        source: '/insights',
        destination: 'https://insights.duyet.net',
        permanent: false,
      },
      {
        source: '/mcp',
        destination: 'https://mcp.duyet.net',
        permanent: false,
      },
      {
        source: '/in',
        destination: 'https://linkedin.com/in/duyet',
        permanent: false,
      },
      {
        source: '/rs',
        destination: 'https://rust-tieng-viet.github.io',
        permanent: false,
      },
      {
        source: '/github',
        destination: 'https://github.com/duyet',
        permanent: false,
      },
      {
        source: '/monitor',
        destination: 'https://clickhouse-monitoring.vercel.app',
        permanent: false,
      },
      {
        source: '/clickhouse',
        destination: 'https://blog.duyet.net/tag/clickhouse',
        permanent: false,
      },
      {
        source: '/tiktok',
        destination: 'https://www.tiktok.com/@duyet.net',
        permanent: false,
      },
      {
        source: '/tt',
        destination: 'https://www.tiktok.com/@duyet.net',
        permanent: false,
      },
      {
        source: '/un',
        destination: 'https://unsplash.com/@_duyet',
        permanent: false,
      },
      {
        source: '/x',
        destination: 'https://x.com/_duyet',
        permanent: false,
      },
      {
        source: '/ni',
        destination: 'https://www.tiktok.com/@niniluungan',
        permanent: false,
      },
      {
        source: '/numi',
        destination: 'https://numi.app',
        permanent: false,
      },
      {
        source: '/ch',
        destination: 'https://blog.duyet.net/series/clickhouse-on-kubernetes?utm_source=duyet.net&utm_medium=linkedin&utm_campaign=duyet.net',
        permanent: false,
      },
      {
        source: '/mo',
        destination: 'https://monica.im/invitation?c=RJF8T7RT',
        permanent: false,
      },
      {
        source: '/api_nini',
        destination: 'https://script.google.com/macros/s/AKfycbyRLwRpcBUlE1Iw2mhSN1zQNHLT7EQsnFVPaduKyEUJMQwaBhEuKXJfWjzUZc20F7sR/exec',
        permanent: false,
      },
      {
        source: '/api/nini',
        destination: 'https://duyet.net/api_nini',
        permanent: false,
      },
    ]
  },
}

module.exports = config