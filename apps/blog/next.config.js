// const { withAxiom } = require('next-axiom')
// const redirects = require('./next.redirects')

/**
 * @type {import('next').NextConfig}
 */
const config = {
  output: "export",
  transpilePackages: ["@duyet/components", "@duyet/libs"],
  images: {
    dangerouslyAllowSVG: true,
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "blog.duyet.net",
      },
      {
        protocol: "https",
        hostname: "*.duyet.net",
      },
      {
        protocol: "https",
        hostname: "*.bp.blogspot.com",
      },
      {
        protocol: "https",
        hostname: "i.giphy.com",
      },
      {
        protocol: "https",
        hostname: "github.com",
      },
      {
        protocol: "https",
        hostname: "githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  // Redirects don't work with static export
  // redirects,
};

module.exports = config;
// module.exports = withAxiom(config)
