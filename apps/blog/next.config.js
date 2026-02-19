// const { withAxiom } = require('next-axiom')
// const redirects = require('./next.redirects')
const { loadEnvConfig } = require("@next/env");
const path = require("node:path");

// Load env from monorepo root and app directory
const rootDir = path.resolve(__dirname, "../..");
loadEnvConfig(rootDir, process.env.NODE_ENV || "development", console, false);
loadEnvConfig(__dirname, process.env.NODE_ENV || "development", console, false);

/**
 * @type {import('next').NextConfig}
 */
const config = {
  output: "export",
  trailingSlash: true,
  transpilePackages: ["@duyet/components", "@duyet/libs"],
  serverExternalPackages: ["sanitize-html", "postcss"],
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
  // DNS prefetch and preconnect hints for external domains
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Content-Signal",
            value: "ai-train=yes, search=yes, ai-input=yes",
          },
        ],
      },
    ];
  },
};

module.exports = config;
// module.exports = withAxiom(config)
