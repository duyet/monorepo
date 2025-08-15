// const { withAxiom } = require('next-axiom')
const redirects = require('./next.redirects')

/**
 * @type {import('next').NextConfig}
 */
const config = {
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
  redirects,
}

module.exports = config
// module.exports = withAxiom(config)
