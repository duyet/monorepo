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
  trailingSlash: false,
  transpilePackages: ["@duyet/components", "@duyet/libs", "@duyet/urls"],
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
  // Webpack 5 can't handle node: protocol URIs in client bundles.
  // Strip the node: prefix so modules resolve through fallback.
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
          resource.request = resource.request.replace(/^node:/, "");
        })
      );
      config.resolve.fallback = {
        ...config.resolve.fallback,
        path: false,
        fs: false,
        os: false,
      };
    }
    return config;
  },
};

module.exports = config;
