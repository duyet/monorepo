/**
 * @type {import('next').NextConfig}
 */
module.exports = {
  output: 'export',
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
  transpilePackages: ['@duyet/components', '@duyet/libs'],
}
