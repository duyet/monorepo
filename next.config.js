/**
 * @type {import('next').NextConfig}
 */
module.exports = {
  images: {
    dangerouslyAllowSVG: true,
    domains: ['i.imgur.com', 'wakatime.com', 'github-readme-stats.vercel.app'],
  },
  async redirects() {
    return [
      {
        source: '/category',
        destination: '/categories',
        permanent: true,
      },
      {
        source: '/page/:id',
        destination: '/?page=:id',
        permanent: true,
      },
      {
        source: '/pages/:id',
        destination: '/:id',
        permanent: true,
      },
      {
        source: '/stats',
        destination: '/insights',
        permanent: true,
      },
    ]
  },
}
