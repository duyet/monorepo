/**
 * @type {import('next').NextConfig}
 */
const { loadEnvConfig } = require("@next/env");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "../..");
loadEnvConfig(rootDir, process.env.NODE_ENV || "development", console, false);
loadEnvConfig(__dirname, process.env.NODE_ENV || "development", console, false);

const config = {
  output: "export",
  images: {
    dangerouslyAllowSVG: true,
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  transpilePackages: ["@duyet/components", "@duyet/libs"],
};

module.exports = config;
