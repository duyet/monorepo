/**
 * @type {import('next').NextConfig}
 */
module.exports = {
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
    ]
  },
}
