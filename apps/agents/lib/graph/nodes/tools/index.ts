/**
 * Tool Nodes (Unit 6)
 *
 * Exports all tool node implementations.
 */

export { SearchBlogNode } from "./search-blog.node";
export { GetBlogPostNode } from "./get-blog-post.node";
export { GetCVNode } from "./get-cv.node";
export { GetGitHubNode } from "./get-github.node";
export { GetAnalyticsNode } from "./get-analytics.node";
export { GetAboutNode } from "./get-about.node";
export { FetchLlmsTxtNode } from "./fetch-llms-txt.node";

/**
 * Tool node registry
 *
 * Maps tool names to their node implementations.
 */
export const TOOL_NODES = {
  "search-blog": () =>
    import("./search-blog.node").then((m) => new m.SearchBlogNode()),
  "get-blog-post": () =>
    import("./get-blog-post.node").then((m) => new m.GetBlogPostNode()),
  "get-cv": () => import("./get-cv.node").then((m) => new m.GetCVNode()),
  "get-github": () =>
    import("./get-github.node").then((m) => new m.GetGitHubNode()),
  "get-analytics": () =>
    import("./get-analytics.node").then((m) => new m.GetAnalyticsNode()),
  "get-about": () =>
    import("./get-about.node").then((m) => new m.GetAboutNode()),
  "fetch-llms-txt": () =>
    import("./fetch-llms-txt.node").then((m) => new m.FetchLlmsTxtNode()),
} as const;
