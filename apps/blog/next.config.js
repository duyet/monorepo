// const { withAxiom } = require('next-axiom')
// const redirects = require('./next.redirects')
const { loadEnvConfig } = require("@next/env");
const path = require("node:path");
const createMDX = require("@next/mdx");

// Load env from monorepo root and app directory
const rootDir = path.resolve(__dirname, "../..");
loadEnvConfig(rootDir, process.env.NODE_ENV || "development", console, false);
loadEnvConfig(__dirname, process.env.NODE_ENV || "development", console, false);

// MDX configuration
const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-gfm", "remark-math"],
    rehypePlugins: [
      ["rehype-slug"],
      ["rehype-autolink-headings"],
      ["rehype-highlight"],
      ["rehype-katex"],
    ],
  },
});

/**
 * @type {import('next').NextConfig}
 */
const config = {
  output: "export",
  transpilePackages: ["@duyet/components", "@duyet/libs"],
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  images: {
    dangerouslyAllowSVG: true,
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "blog.duyet.net",
      },
      {
        protocol: "https",
        hostname: "*.duyet.net",
      },
      {
        protocol: "https",
        hostname: "*.bp.blogspot.com",
      },
      {
        protocol: "https",
        hostname: "i.giphy.com",
      },
      {
        protocol: "https",
        hostname: "github.com",
      },
      {
        protocol: "https",
        hostname: "githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  // Redirects don't work with static export
  // redirects,
};

module.exports = withMDX(config);
// module.exports = withAxiom(withMDX(config))
