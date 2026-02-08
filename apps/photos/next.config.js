/**
 * @type {import('next').NextConfig}
 */
const { loadEnvConfig } = require("@next/env");
const path = require("node:path");

// Load env from monorepo root and app directory
const rootDir = path.resolve(__dirname, "../..");
loadEnvConfig(rootDir, process.env.NODE_ENV || "development", console, false);
loadEnvConfig(__dirname, process.env.NODE_ENV || "development", console, false);

const config = {
  output: "export",
  // Increase timeout for static generation to allow slow API calls
  staticPageGenerationTimeout: 180, // 3 minutes
  images: {
    // Keep unoptimized for static export compatibility
    // Static export doesn't support Next.js Image Optimization
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
    ],
  },
  transpilePackages: ["@duyet/components", "@duyet/libs"],
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
        ],
      },
    ];
  },
};

module.exports = config;
