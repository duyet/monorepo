/**
 * Static visual graph layout data.
 *
 * This is the fixed layout produced by GraphRouter.getVisualGraph() with the
 * default node set. Extracted here so callers don't need to instantiate
 * GraphRouter just to read structural/display information.
 */

import type { VisualGraphData } from "./graph/types";

export const VISUAL_GRAPH_DATA: VisualGraphData = {
  nodes: [
    {
      id: "llm-router",
      position: { x: 0, y: 0 },
      type: "conditional",
      data: {
        label: "LLM Router",
        description: "Decides next action based on conversation state",
        nodeType: "conditional",
      },
    },
    {
      id: "synthesis",
      position: { x: 250, y: 0 },
      type: "synthesis",
      data: {
        label: "Synthesis",
        description: "Combines tool results into final response with sources",
        nodeType: "synthesis",
      },
    },
    {
      id: "search-blog",
      position: { x: 500, y: 0 },
      type: "tool",
      data: {
        label: "Search Blog",
        description: "Search blog posts by topic, keywords, or technology",
        nodeType: "tool",
      },
    },
    {
      id: "get-blog-post",
      position: { x: 750, y: 0 },
      type: "tool",
      data: {
        label: "Get Blog Post",
        description: "Fetch full content of a specific blog post by URL",
        nodeType: "tool",
      },
    },
    {
      id: "get-cv",
      position: { x: 0, y: 150 },
      type: "tool",
      data: {
        label: "Get CV",
        description:
          "Retrieve Duyet's CV/Resume information (summary or detailed)",
        nodeType: "tool",
      },
    },
    {
      id: "get-github",
      position: { x: 250, y: 150 },
      type: "tool",
      data: {
        label: "Get GitHub",
        description:
          "Fetch recent GitHub activity including commits, PRs, and issues",
        nodeType: "tool",
      },
    },
    {
      id: "get-analytics",
      position: { x: 500, y: 150 },
      type: "tool",
      data: {
        label: "Get Analytics",
        description: "Get contact form analytics and reports",
        nodeType: "tool",
      },
    },
    {
      id: "get-about",
      position: { x: 750, y: 150 },
      type: "tool",
      data: {
        label: "Get About",
        description: "Get general background information about Duyet",
        nodeType: "tool",
      },
    },
    {
      id: "fetch-llms-txt",
      position: { x: 0, y: 300 },
      type: "tool",
      data: {
        label: "Fetch llms.txt",
        description:
          "Fetch llms.txt from any duyet.net domain for AI-readable documentation",
        nodeType: "tool",
      },
    },
  ],
  edges: [
    // router → tool nodes
    { id: "router-search", source: "llm-router", target: "search-blog" },
    { id: "router-post", source: "llm-router", target: "get-blog-post" },
    { id: "router-cv", source: "llm-router", target: "get-cv" },
    { id: "router-github", source: "llm-router", target: "get-github" },
    { id: "router-analytics", source: "llm-router", target: "get-analytics" },
    { id: "router-about", source: "llm-router", target: "get-about" },
    { id: "router-llms", source: "llm-router", target: "fetch-llms-txt" },
    // tool nodes → synthesis
    { id: "search-synthesis", source: "search-blog", target: "synthesis" },
    { id: "post-synthesis", source: "get-blog-post", target: "synthesis" },
    { id: "cv-synthesis", source: "get-cv", target: "synthesis" },
    { id: "github-synthesis", source: "get-github", target: "synthesis" },
    {
      id: "analytics-synthesis",
      source: "get-analytics",
      target: "synthesis",
    },
    { id: "about-synthesis", source: "get-about", target: "synthesis" },
    { id: "llms-synthesis", source: "fetch-llms-txt", target: "synthesis" },
    // synthesis → done
    { id: "synthesis-done", source: "synthesis", target: "done" },
  ],
};
