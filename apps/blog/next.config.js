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
  // Support for MDX - we'll handle this via getPost utility functions
  // MDX processing is done at runtime with next-mdx-remote
  experimental: {
    // Enable MDX support if needed for future versions
    mdxRs: false, // Using next-mdx-remote instead
  },
  // Redirects don't work with static export
  // redirects,
};

module.exports = config;
// module.exports = withAxiom(config)
