const { withAxiom } = require('next-axiom');

/**
 * @type {import('next').NextConfig}
 */
const config = {
  swcMinify: true,
  transpilePackages: ['@duyet/components', '@duyet/libs'],
  images: {
    dangerouslyAllowSVG: true,
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
    ];
  },
};

module.exports = withAxiom(config);
