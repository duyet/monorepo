/**
 * @type {import('next').NextConfig['redirects']}
 */
const redirects = async () => [
  {
    source: '/categories',
    destination: '/category',
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
    destination: 'https://insights.duyet.net',
    permanent: true,
  },
  {
    // Non-html to .html blog post
    source: '/:year/:month/:slug/',
    destination: '/:year/:month/:slug.html',
    permanent: true,
  },
  {
    source: '/series/clickhouse',
    destination: '/series/clickhouse-on-kubernetes',
    permanent: true,
  },
];

module.exports = redirects;
