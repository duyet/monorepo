/**
 * @type {import('next').NextConfig}
 */
module.exports = {
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
        destination: '/insights',
        permanent: true,
      },
    ];
  },
  transpilePackages: ['@duyet/components', '@duyet/libs'],
};
