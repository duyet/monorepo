/** @type {import('next').NextConfig} */

import path from "node:path";
import { loadEnvConfig } from "@next/env";

// Load env from monorepo root and app directory
const rootDir = path.resolve(process.cwd(), "../..");
loadEnvConfig(rootDir, process.env.NODE_ENV || "development", console, false);
loadEnvConfig(
  process.cwd(),
  process.env.NODE_ENV || "development",
  console,
  false
);

const nextConfig = {
  reactStrictMode: true,
  // Removed static export to enable API routes
  // output: "export",
  transpilePackages: ["@duyet/components", "@duyet/config", "@duyet/libs"],
  // Enable image optimization for deployment
  images: {
    unoptimized: false,
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
        ],
      },
    ];
  },
};

export default nextConfig;
