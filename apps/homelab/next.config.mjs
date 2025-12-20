/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  transpilePackages: ["@duyet/components", "@duyet/config", "@duyet/libs"],
  eslint: {
    dirs: ["app", "components", "lib"],
  },
};

export default nextConfig;
