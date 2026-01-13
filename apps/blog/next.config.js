// const { withAxiom } = require('next-axiom')
// const redirects = require('./next.redirects')
const { loadEnvConfig } = require("@next/env");
const path = require("node:path");

// Load env from monorepo root and app directory
const rootDir = path.resolve(__dirname, "../..");
loadEnvConfig(rootDir, process.env.NODE_ENV || "development", console, false);
loadEnvConfig(__dirname, process.env.NODE_ENV || "development", console, false);

// MDX configuration
const withMDX = require("@next/mdx")({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  output: "export",
  transpilePackages: ["@duyet/components", "@duyet/libs"],
  pageExtensions: ["js", "jsx", "ts", "tsx", "mdx"],
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

module.exports = withMDX(nextConfig);
// module.exports = withAxiom(config)
