/**
 * @type {import('next').NextConfig}
 */
module.exports = {
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
};
