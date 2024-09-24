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
  transpilePackages: ['@duyet/components', '@duyet/libs'],
}
