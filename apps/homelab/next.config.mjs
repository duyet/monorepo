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
  output: "export",
  transpilePackages: ["@duyet/components", "@duyet/config", "@duyet/libs"],
};

export default nextConfig;
