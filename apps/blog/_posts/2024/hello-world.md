---
title: "Hello World"
date: "2024-12-15"
author: "duyet"
excerpt: "My first blog post with the new MDX support"
tags: ["Hello", "World", "MDX"]
---

# Hello World

Welcome to my blog! This is a test post to verify that the MDX support is working correctly.

## Features

The blog now supports:

- MDX files with interactive components
- Preserved existing .md posts
- Rich content components

## Components Available

1. ToolComparison
2. FeatureMatrix
3. WakaTimeChart
4. ToolTimeline
5. WorkflowDiagram
6. VersionDiff
7. ToolList

Let's try a ToolComparison component:

<ToolComparison
  tools={[
    {
      name: "Next.js",
      description: "React framework with server-side rendering",
      pros: ["Fast", "SEO-friendly", "Developer-friendly"],
      cons: ["Learning curve", "Large bundle size"],
      rating: 4
    }
  ]}
/>

And a FeatureMatrix:

<FeatureMatrix
  features={[{ name: "Performance" }, { name: "Ease of Use" }]}
  tools={[
    {
      name: "Next.js",
      features: { Performance: "high", "Ease of Use": "medium" }
    }
  ]}
/>

The components are working! 🎉