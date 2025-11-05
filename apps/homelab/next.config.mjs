/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@duyet/components', '@duyet/config', '@duyet/libs'],
  eslint: {
    dirs: ['app', 'components', 'lib'],
  },
}

export default nextConfig
