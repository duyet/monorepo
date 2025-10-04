/**
 * @type {import('next').NextConfig}
 */
const config = {
  output: 'export',
  trailingSlash: false,
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
}

module.exports = config
