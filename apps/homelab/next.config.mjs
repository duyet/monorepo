/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  transpilePackages: ["@duyet/components", "@duyet/config", "@duyet/libs"],
};

export default nextConfig;
