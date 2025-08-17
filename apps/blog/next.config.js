// const { withAxiom } = require('next-axiom')
// const redirects = require('./next.redirects')

/**
 * @type {import('next').NextConfig}
 */
const config = {
  output: 'export',
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
  // Redirects don't work with static export
  // redirects,
}

module.exports = config
// module.exports = withAxiom(config)
