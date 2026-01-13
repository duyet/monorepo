---
title: "MDX Components Demo: Interactive Content in Blog Posts"
slug: /2024/12/mdx-components-demo
date: 2024-12-10
category: "Tutorial"
tags: ["MDX", "React", "Next.js", "Interactive"]
description: "Demonstration of 7 interactive MDX components for rich blog content"
featured: true
snippet: "Explore the new interactive MDX components available in the blog with live examples"
---

import {
  ToolComparison,
  FeatureMatrix,
  WakaTimeChart,
  ToolTimeline,
  WorkflowDiagram,
  VersionDiff,
  ToolList
} from '@/components/mdx';

# MDX Components Demo

This post demonstrates the 7 new interactive MDX components that are now available in the blog. These components allow for rich, interactive content directly in markdown files.

## 1. Tool Comparison

Compare tools side-by-side with pros and cons:

<ToolComparison
  tools={[
    {
      name: "Next.js",
      description: "React framework for production",
      pros: ["SSR/SSG", "TypeScript support", "Built-in routing", "Vercel integration"],
      cons: ["Bundle size", "Learning curve"],
      category: "Framework"
    },
    {
      name: "Astro",
      description: "All-in-one web framework",
      pros: ["Island architecture", "Fast by default", "Multiple UI frameworks"],
      cons: ["Ecosystem smaller", "Dynamic features require setup"],
      category: "Framework"
    }
  ]}
/>

## 2. Feature Matrix

Compare features across multiple tools:

<FeatureMatrix
  features={[
    { name: "SSR", description: "Server-side rendering" },
    { name: "SSG", description: "Static site generation" },
    { name: "ISR", description: "Incremental static regeneration" },
    { name: "MDX", description: "Markdown + JSX support" },
    { name: "Image Optimization", description: "Automatic image optimization" }
  ]}
  tools={[
    {
      name: "Next.js",
      features: {
        "SSR": true,
        "SSG": true,
        "ISR": true,
        "MDX": "Plugin",
        "Image Optimization": true
      }
    },
    {
      name: "Astro",
      features: {
        "SSR": true,
        "SSG": true,
        "ISR": "Experimental",
        "MDX": "Built-in",
        "Image Optimization": "Manual"
      }
    },
    {
      name: "Gatsby",
      features: {
        "SSR": "Limited",
        "SSG": true,
        "ISR": false,
        "MDX": "Plugin",
        "Image Optimization": true
      }
    }
  ]}
/>

## 3. WakaTime Chart

Visualize development activity with line charts:

<WakaTimeChart
  data={[
    { date: "Mon", hours: 4.5 },
    { date: "Tue", hours: 6.2 },
    { date: "Wed", hours: 5.1 },
    { date: "Thu", hours: 7.3 },
    { date: "Fri", hours: 8.1 },
    { date: "Sat", hours: 3.2 },
    { date: "Sun", hours: 2.8 }
  ]}
  title="Weekly Development Activity"
  description="Hours spent coding per day"
  type="line"
/>

Or with area chart:

<WakaTimeChart
  data={[
    { date: "Q1", hours: 120 },
    { date: "Q2", hours: 150 },
    { date: "Q3", hours: 180 },
    { date: "Q4", hours: 160 }
  ]}
  title="Quarterly Development Hours"
  type="area"
  showGrid={false}
/>

## 4. Tool Timeline

Display events in chronological order:

<ToolTimeline
  title="Development Journey"
  events={[
    {
      date: "January 2024",
      title: "Project Kickoff",
      description: "Started development on the new blog platform with Next.js 14",
      status: "important",
      category: "Milestone"
    },
    {
      date: "March 2024",
      title: "MDX Integration",
      description: "Added MDX support for richer content creation",
      status: "success",
      category: "Feature"
    },
    {
      date: "June 2024",
      title: "Performance Issues",
      description: "Identified bundle size issues in production build",
      status: "failed",
      category: "Bug"
    },
    {
      date: "September 2024",
      title: "Performance Fix",
      description: "Optimized bundle splitting and lazy loading",
      status: "success",
      category: "Optimization"
    },
    {
      date: "November 2024",
      title: "Interactive Components",
      description: "Added 7 interactive components for MDX posts",
      status: "success",
      category: "Feature"
    }
  ]}
/>

## 5. Workflow Diagram

Visualize processes with animated SVG diagrams:

<WorkflowDiagram
  title="MDX Publishing Workflow"
  animated={true}
  steps={[
    {
      label: "Write MDX",
      description: "Create content with interactive components",
      icon: "📝"
    },
    {
      label: "Process MDX",
      description: "Compile and sanitize content",
      icon: "⚙️"
    },
    {
      label: "Build Site",
      description: "Generate static pages",
      icon: "🏗️"
    },
    {
      label: "Deploy",
      description: "Publish to CDN",
      icon: "🚀"
    },
    {
      label: "Monitor",
      description: "Track performance & errors",
      icon: "📊"
    }
  ]}
/>

## 6. Version Diff

Show code differences in Git style:

<VersionDiff
  from="v1.0"
  to="v2.0"
  title="Breaking Changes"
  lines={[
    { type: "removed", content: "const oldFunction = () => {", line: 1 },
    { type: "removed", content: "  console.log('old');", line: 2 },
    { type: "removed", content: "}", line: 3 },
    { type: "unchanged", content: "", line: 4 },
    { type: "added", content: "export const newFunction = () => {", line: 5 },
    { type: "added", content: "  console.log('new and improved');", line: 6 },
    { type: "added", content: "  return true;", line: 7 },
    { type: "added", content: "}", line: 8 },
    { type: "unchanged", content: "", line: 9 },
    { type: "removed", content: "const version = '1.0';", line: 10 },
    { type: "added", content: "const version = '2.0';", line: 11 }
  ]}
/>

## 7. Tool List

Create searchable, filterable tool directories:

<ToolList
  title="Developer Tools Directory"
  tools={[
    {
      name: "Vercel",
      description: "Deploy websites and web apps",
      category: "Hosting",
      tags: ["deployment", "edge", "serverless"],
      url: "https://vercel.com",
      featured: true
    },
    {
      name: "Cloudflare",
      description: "CDN and security platform",
      category: "Hosting",
      tags: ["cdn", "security", "workers"],
      url: "https://cloudflare.com",
      featured: false
    },
    {
      name: "GitHub Actions",
      description: "CI/CD automation platform",
      category: "CI/CD",
      tags: ["automation", "testing", "deploy"],
      url: "https://github.com/features/actions",
      featured: true
    },
    {
      name: "Docker",
      description: "Containerization platform",
      category: "DevOps",
      tags: ["containers", "docker-compose", "kubernetes"],
      url: "https://docker.com",
      featured: false
    },
    {
      name: "PostHog",
      description: "Product analytics platform",
      category: "Analytics",
      tags: ["analytics", "insights", "tracking"],
      url: "https://posthog.com",
      featured: false
    },
    {
      name: "Figma",
      description: "Collaborative design tool",
      category: "Design",
      tags: ["design", "mockups", "prototyping"],
      url: "https://figma.com",
      featured: false
    }
  ]}
/>

## How to Use These Components

These components are automatically available in any MDX post. Simply import them at the top of your file:

```mdx
import { ToolComparison, FeatureMatrix, ... } from '@/components/mdx';

# Your Content Here
```

Each component is designed to be:
- **Responsive**: Works on all screen sizes
- **Accessible**: Follows WCAG guidelines
- **Theme-aware**: Respects dark/light mode
- **Type-safe**: Fully typed with TypeScript

## Next Steps

1. **Try it out**: Create your own MDX post with these components
2. **Experiment**: Mix and match different components
3. **Contribute**: Suggest new components or improvements

---

*This demo post showcases the power of MDX + React components for creating rich, interactive blog content.*