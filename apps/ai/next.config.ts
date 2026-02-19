import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@duyet/components', '@duyet/libs'],
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
    }
    return config
  },
}

export default nextConfig
