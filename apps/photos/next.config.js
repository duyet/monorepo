/**
 * @type {import('next').NextConfig}
 */
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  transpilePackages: ['@duyet/components', '@duyet/libs'],
  experimental: {
    typedRoutes: true,
  },
};
