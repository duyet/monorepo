/**
 * @type {import('next').NextConfig}
 */
module.exports = {
  images: {
    domains: ['i.imgur.com'],
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
