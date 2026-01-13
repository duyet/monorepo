---
slug: /2025/01/mdx-demo
title: "MDX Support Demo - All 7 Interactive Components"
date: 2025-01-15
category: Tutorial
tags: [MDX, Next.js, React, Interactive, Components]
description: "A comprehensive demo of all 7 interactive MDX components available in the blog"
---

This post demonstrates all the interactive MDX components now available in the blog.

## Tool Comparison Component

The ToolComparison component displays tools in card format with pros, cons, and ratings:

```tsx
<ToolComparison tools={[
  {
    name: "Next.js",
    pros: ["Fast performance", "Great ecosystem", "Built-in routing"],
    cons: ["Build complexity", "Bundle size"],
    rating: 9
  },
  {
    name: "Gatsby",
    pros: ["Rich plugin system", "Great for blogs"],
    cons: ["Slower builds", "Complex configuration"],
    rating: 7
  }
]} title="Framework Comparison" />
```

<ToolComparison tools={[
  {
    name: "Next.js",
    pros: ["Fast performance", "Great ecosystem", "Built-in routing", "Server-side rendering"],
    cons: ["Build complexity", "Bundle size", "Learning curve"],
    rating: 9
  },
  {
    name: "Gatsby",
    pros: ["Rich plugin system", "Great for blogs", "GraphQL layer"],
    cons: ["Slower builds", "Complex configuration", "Steeper learning curve"],
    rating: 7
  },
  {
    name: "Remix",
    pros: ["Simple routing", "Web fundamentals", "Great DX"],
    cons: ["Smaller ecosystem", "Newer framework"],
    rating: 8
  }
]} title="React Framework Comparison" />

## Feature Matrix Component

The FeatureMatrix component provides a sortable table with color-coded scores:

```tsx
<FeatureMatrix
  features={[
    {
      name: "Performance",
      description: "Build speed and runtime performance",
      scores: { "Tool A": 9, "Tool B": 7, "Tool C": 5 }
    }
  ]}
  tools={["Tool A", "Tool B", "Tool C"]}
  title="Feature Comparison"
/>
```

<FeatureMatrix
  features={[
    {
      name: "Build Speed",
      description: "How quickly the tool builds",
      scores: { "Next.js": 9, "Gatsby": 6, "Remix": 8 }
    },
    {
      name: "Developer Experience",
      description: "Developer tooling and DX",
      scores: { "Next.js": 9, "Gatsby": 7, "Remix": 8 }
    },
    {
      name: "Plugin Ecosystem",
      description: "Available plugins and integrations",
      scores: { "Next.js": 8, "Gatsby": 9, "Remix": 6 }
    },
    {
      name: "Learning Curve",
      description: "Ease of learning and onboarding",
      scores: { "Next.js": 6, "Gatsby": 5, "Remix": 7 }
    }
  ]}
  tools={["Next.js", "Gatsby", "Remix"]}
  title="Framework Feature Matrix"
/>

## WakaTime Chart Component

The WakaTimeChart component shows coding activity over time with a stacked area chart:

```tsx
<WakaTimeChart
  data={[
    { date: "2025-01-01", coding: 4, meeting: 1, planning: 0.5, documentation: 0.5, other: 0 },
    { date: "2025-01-02", coding: 6, meeting: 0.5, planning: 0.5, documentation: 1, other: 0 }
  ]}
  title="Weekly Coding Activity"
/>
```

<WakaTimeChart
  data={[
    { date: "2025-01-01", coding: 4, meeting: 1, planning: 0.5, documentation: 0.5, other: 0 },
    { date: "2025-01-02", coding: 6, meeting: 0.5, planning: 0.5, documentation: 1, other: 0 },
    { date: "2025-01-03", coding: 5, meeting: 2, planning: 1, documentation: 0.5, other: 0.5 },
    { date: "2025-01-04", coding: 7, meeting: 0, planning: 0.5, documentation: 1, other: 0.5 },
    { date: "2025-01-05", coding: 3, meeting: 2, planning: 1.5, documentation: 0, other: 0 },
    { date: "2025-01-06", coding: 6, meeting: 1, planning: 0.5, documentation: 1, other: 0.5 },
    { date: "2025-01-07", coding: 8, meeting: 0.5, planning: 0.5, documentation: 0.5, other: 0.5 },
  ]}
  title="Weekly Development Activity"
/>

## Tool Timeline Component

The ToolTimeline component shows process steps in a timeline format:

```tsx
<ToolTimeline
  orientation="vertical"
  items={[
    { time: "Day 1", title: "Research", description: "Exploring available tools", status: "completed" },
    { time: "Day 2", title: "Selection", description: "Choosing the best tool", status: "completed" },
    { time: "Day 3-5", title: "Implementation", description: "Building the integration", status: "in-progress" }
  ]}
  title="Project Timeline"
/>
```

<ToolTimeline
  orientation="vertical"
  items={[
    { time: "Q4 2024", title: "Planning", description: "Define requirements and scope for MDX support", status: "completed" },
    { time: "Week 1", title: "Dependencies", description: "Add MDX dependencies and configure tooling", status: "completed" },
    { time: "Week 2", title: "Components", description: "Build 7 interactive MDX components", status: "completed" },
    { time: "Week 3", title: "Integration", description: "Integrate with existing blog infrastructure", status: "completed" },
    { time: "Week 4", title: "Testing", description: "Test all components and edge cases", status: "in-progress" },
    { time: "Week 5", title: "Documentation", description: "Write documentation and examples", status: "pending" },
    { time: "Week 6", title: "Launch", description: "Deploy to production", status: "pending" }
  ]}
  title="MDX Implementation Timeline"
/>

## Workflow Diagram Component

The WorkflowDiagram component visualizes a multi-step process with progress tracking:

```tsx
<WorkflowDiagram
  steps={[
    { id: "1", title: "Setup", description: "Initial setup", status: "completed" },
    { id: "2", title: "Develop", description: "Feature development", status: "in-progress", dependencies: ["1"] }
  ]}
  title="Development Workflow"
/>
```

<WorkflowDiagram
  steps={[
    {
      id: "research",
      title: "Research",
      description: "Study existing MDX implementations and choose libraries",
      status: "completed"
    },
    {
      id: "dependencies",
      title: "Setup",
      description: "Install and configure MDX dependencies",
      status: "completed",
      dependencies: ["research"]
    },
    {
      id: "components",
      title: "Build",
      description: "Create 7 interactive components",
      status: "completed",
      dependencies: ["dependencies"]
    },
    {
      id: "integration",
      title: "Integrate",
      description: "Connect MDX system to blog framework",
      status: "completed",
      dependencies: ["components"]
    },
    {
      id: "examples",
      title: "Examples",
      description: "Create sample content showing all features",
      status: "completed",
      dependencies: ["integration"]
    },
    {
      id: "testing",
      title: "Test",
      description: "Verify all components work correctly",
      status: "in-progress",
      dependencies: ["examples"]
    },
    {
      id: "review",
      title: "Review",
      description: "Code review and documentation updates",
      status: "pending",
      dependencies: ["testing"]
    }
  ]}
  title="MDX Support Development Workflow"
/>

## Version Diff Component

The VersionDiff component shows changes between versions like GitHub PRs:

```tsx
<VersionDiff
  fromVersion="v1.0.0"
  toVersion="v2.0.0"
  changes={[
    {
      filename: "app/post.ts",
      additions: 15,
      deletions: 3,
      changes: 18,
      diff: "+ Added extension support\n+ Updated Post type\n- Removed old field"
    }
  ]}
  title="Version Changes"
/>
```

<VersionDiff
  fromVersion="v1.0.0"
  toVersion="v1.2.0"
  changes={[
    {
      filename: "packages/libs/markdownToHtml.ts",
      additions: 45,
      deletions: 12,
      changes: 57,
      diff: `+ import remarkMdx from "remark-mdx"
+ import { unified } from "unified"
+ interface MarkdownToHtmlOptions {
+   isMDX?: boolean;
+ }
+ export async function markdownToHtml(markdown, options = {})
+   const { isMDX = false } = options;
+   if (isMDX) { processor.use(remarkMdx) }
  // Sanitization updates for MDX
-  // Old single-process function
-  const result = await unified()...`
    },
    {
      filename: "packages/libs/getPost.ts",
      additions: 18,
      deletions: 8,
      changes: 26,
      diff: `+ // Support .mdx files
+ if (!file.endsWith(".md") && !file.endsWith(".mdx")) { return []; }
+ const possiblePaths = [".mdx", ".md"]
+ extension: fullPath.endsWith(".mdx") ? "mdx" : "md"`
    },
    {
      filename: "apps/blog/package.json",
      additions: 12,
      deletions: 0,
      changes: 12,
      diff: `+ "@mdx-js/loader": "^3.0.1",
+ "next-mdx-remote": "^5.0.0",
+ "remark-mdx": "^3.0.1",
+ "recharts": "^2.12.7",`
    }
  ]}
  title="Version Changes - MDX Support Addition"
/>

## Tool List Component

The ToolList component provides a filterable, searchable tool catalog:

```tsx
<ToolList
  tools={[
    {
      name: "Tool A",
      description: "Great for X",
      tags: ["tag1", "tag2"],
      category: "Build tools",
      featured: true
    }
  ]}
  title="Available Tools"
/>
```

<ToolList
  tools={[
    {
      name: "Next.js",
      description: "The React framework for production with server components",
      tags: ["react", "ssr", "rsc", "fullstack"],
      category: "framework",
      featured: true
    },
    {
      name: "MDX",
      description: "Markdown for the modern component era",
      tags: ["markdown", "components", "jsx", "documentation"],
      category: "format",
      featured: true
    },
    {
      name: "Recharts",
      description: "Composable charting library built on React components",
      tags: ["charts", "visualization", "d3", "data"],
      category: "visualization",
      featured: false
    },
    {
      name: "Remark",
      description: "Markdown processor powered by plugins",
      tags: ["markdown", "parser", "plugins"],
      category: "tooling",
      featured: false
    },
    {
      name: "Framer Motion",
      description: "Production-ready motion library for React",
      tags: ["animation", "motion", "react"],
      category: "library",
      featured: false
    },
    {
      name: "Tailwind CSS",
      description: "Utility-first CSS framework",
      tags: ["css", "styling", "utility", "design"],
      category: "styling",
      featured: true
    }
  ]}
  title="Component Toolkit"
/>

## Summary

You can use these components in your MDX posts simply by importing them. The blog platform now supports:

1. **ToolComparison** - Card-based comparison UI
2. **FeatureMatrix** - Sortable, color-coded comparison table
3. **WakaTimeChart** - Stacked area chart for metrics
4. **ToolTimeline** - Horizontal/vertical timeline view
5. **WorkflowDiagram** - Process flow with status tracking
6. **VersionDiff** - Git-style diff viewer
7. **ToolList** - Searchable, filterable tool catalog

The syntax is simply `<ComponentName props={data} />` directly in your MDX files.

## Next Steps

- Try creating your own MDX post
- Mix and match components for rich content
- All existing markdown features (math, tables, etc.) still work
- Your existing `.md` posts are unaffected