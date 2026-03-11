export * from "./clearUrl";
export * from "./date";
export * from "./errors";
export * from "./extractHeadings";
export * from "./fetcher";
export * from "./getRelatedPosts";
export * from "./getSlug";
export * from "./logger";
export * from "./markdownToHtml";

// next-routes excluded: imports next/server which pulls in ua-parser-js
// (uses __dirname, incompatible with Cloudflare Pages Functions edge runtime)
//
// Usage: Import directly via subpath export
//   import { createPingRoute } from "@duyet/libs/next-routes";
//
// Used in: blog (ping), cv (ping), home (ping), insights (ping, llms.txt), photos (ping)
// Tests: packages/libs/__tests__/next-routes.test.ts
export * from "./object-utils";
export * from "./utils";
