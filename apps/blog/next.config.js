const { withAxiom } = require('next-axiom');
const redirects = require('./next.redirects');

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
  redirects,
};

module.exports = withAxiom(config);
