---
title: "MDX Components Demo"
date: "2024-12-15"
excerpt: "Interactive component showcase for the new MDX support in the blog - featuring 7 powerful components for rich content."
tags: ["MDX", "React", "Components", "Interactive"]
category: "Development"
category_slug: "development"
series: "Web Development"
---

## Introduction

This post demonstrates the new **MDX support** for our blog platform. You can now write posts with interactive React components directly in your markdown files!

All the components below are rendered using real React components within MDX content.

## 1. Tool Comparison Component

Let's compare some popular developer tools:

```jsx
<ToolComparison tools={[
  {
    name: "Visual Studio Code",
    description: "Free, lightweight, and extensible code editor",
    pros: ["Excellent extension ecosystem", "Fast performance", "Great IntelliSense"],
    cons: ["Can be memory heavy with extensions", "Complex settings", "No native project management"],
    rating: 4.5
  },
  {
    name: "WebStorm",
    description: "Professional IDE for JavaScript and TypeScript",
    pros: ["Smart code completion", "Built-in debugging", "Excellent refactoring tools"],
    cons: ["Subscription cost", "Resource intensive", "Steep learning curve"],
    rating: 4.2
  },
  {
    name: "Neovim",
    description: "Hyperextensible Vim-based text editor",
    pros: ["Extremely fast", "Completely free", "Keyboard driven"],
    cons: ["High configuration required", "Steep learning curve", "Plugin management"],
    rating: 4.0
  }
]} />
```

<ToolComparison tools={[
  {
    name: "Visual Studio Code",
    description: "Free, lightweight, and extensible code editor",
    pros: ["Excellent extension ecosystem", "Fast performance", "Great IntelliSense"],
    cons: ["Can be memory heavy with extensions", "Complex settings", "No native project management"],
    rating: 4.5
  },
  {
    name: "WebStorm",
    description: "Professional IDE for JavaScript and TypeScript",
    pros: ["Smart code completion", "Built-in debugging", "Excellent refactoring tools"],
    cons: ["Subscription cost", "Resource intensive", "Steep learning curve"],
    rating: 4.2
  },
  {
    name: "Neovim",
    description: "Hyperextensible Vim-based text editor",
    pros: ["Extremely fast", "Completely free", "Keyboard driven"],
    cons: ["High configuration required", "Steep learning curve", "Plugin management"],
    rating: 4.0
  }
]} />

## 2. Feature Matrix Component

Here's a comparison of modern build tools:

```jsx
<FeatureMatrix
  features={[
    { name: "Speed", description: "Build time performance" },
    { name: "Ease", description: "Setup complexity" },
    { name: "Plugin", description: "Plugin ecosystem" },
    { name: "Tree", description: "Tree shaking" },
    { name: "Cache", description: "Incremental builds" }
  ]}
  tools={[
    {
      name: "Vite",
      features: { Speed: 5, Ease: 5, Plugin: 4, Tree: 5, Cache: 4 }
    },
    {
      name: "Webpack",
      features: { Speed: 3, Ease: 3, Plugin: 5, Tree: 4, Cache: 4 }
    },
    {
      name: "esbuild",
      features: { Speed: 5, Ease: 4, Plugin: 2, Tree: 3, Cache: 3 }
    },
    {
      name: "Turbopack",
      features: { Speed: 5, Ease: 3, Plugin: 3, Tree: 5, Cache: 5 }
    }
  ]}
/>
```

<FeatureMatrix
  features={[
    { name: "Speed", description: "Build time performance" },
    { name: "Ease", description: "Setup complexity" },
    { name: "Plugin", description: "Plugin ecosystem" },
    { name: "Tree", description: "Tree shaking" },
    { name: "Cache", description: "Incremental builds" }
  ]}
  tools={[
    {
      name: "Vite",
      features: { Speed: 5, Ease: 5, Plugin: 4, Tree: 5, Cache: 4 }
    },
    {
      name: "Webpack",
      features: { Speed: 3, Ease: 3, Plugin: 5, Tree: 4, Cache: 4 }
    },
    {
      name: "esbuild",
      features: { Speed: 5, Ease: 4, Plugin: 2, Tree: 3, Cache: 3 }
    },
    {
      name: "Turbopack",
      features: { Speed: 5, Ease: 3, Plugin: 3, Tree: 5, Cache: 5 }
    }
  ]}
/>

## 3. WakaTime Chart Component

Tracking development hours over time:

```jsx
<WakaTimeChart
  data={[
    { date: "2024-12-01", hours: 4.2 },
    { date: "2024-12-02", hours: 6.5 },
    { date: "2024-12-03", hours: 5.0 },
    { date: "2024-12-04", hours: 7.2 },
    { date: "2024-12-05", hours: 8.5 },
    { date: "2024-12-06", hours: 4.8 },
    { date: "2024-12-07", hours: 3.5 }
  ]}
  title="Weekly Development Activity"
/>
```

<WakaTimeChart
  data={[
    { date: "2024-12-01", hours: 4.2 },
    { date: "2024-12-02", hours: 6.5 },
    { date: "2024-12-03", hours: 5.0 },
    { date: "2024-12-04", hours: 7.2 },
    { date: "2024-12-05", hours: 8.5 },
    { date: "2024-12-06", hours: 4.8 },
    { date: "2024-12-07", hours: 3.5 }
  ]}
  title="Weekly Development Activity"
/>

## 4. Tool Timeline Component

Project evolution timeline:

```jsx
<ToolTimeline
  orientation="vertical"
  events={[
    {
      date: "2024-01-15",
      title: "Initial Release",
      description: "Launched version 1.0 with core features including user authentication."
    },
    {
      date: "2024-03-22",
      title: "Performance Update",
      description: "Major performance improvements with reduced bundle size by 40%.",
      link: "https://example.com"
    },
    {
      date: "2024-06-10",
      title: "Enterprise Features",
      description: "Added SSO, team collaboration tools, and advanced analytics."
    },
    {
      date: "2024-09-05",
      title: "API Version 2",
      description: "Complete API redesign with REST and GraphQL endpoints."
    }
  ]}
/>
```

<ToolTimeline
  orientation="vertical"
  events={[
    {
      date: "2024-01-15",
      title: "Initial Release",
      description: "Launched version 1.0 with core features including user authentication."
    },
    {
      date: "2024-03-22",
      title: "Performance Update",
      description: "Major performance improvements with reduced bundle size by 40%.",
      link: "https://example.com"
    },
    {
      date: "2024-06-10",
      title: "Enterprise Features",
      description: "Added SSO, team collaboration tools, and advanced analytics."
    },
    {
      date: "2024-09-05",
      title: "API Version 2",
      description: "Complete API redesign with REST and GraphQL endpoints."
    }
  ]}
/>

## 5. Workflow Diagram Component

Development workflow visualization:

```jsx
<WorkflowDiagram
  title="Modern CI/CD Workflow"
  steps={[
    {
      id: "dev",
      title: "Development",
      description: "Write & test code",
      position: { x: 150, y: 250 }
    },
    {
      id: "commit",
      title: "Commit",
      description: "Git push changes",
      position: { x: 350, y: 150 }
    },
    {
      id: "build",
      title: "Build",
      description: "Test & compile",
      position: { x: 550, y: 250 }
    },
    {
      id: "deploy",
      title: "Deploy",
      description: "Production release",
      position: { x: 750, y: 150 }
    }
  ]}
/>
```

<WorkflowDiagram
  title="Modern CI/CD Workflow"
  steps={[
    {
      id: "dev",
      title: "Development",
      description: "Write & test code",
      position: { x: 150, y: 250 }
    },
    {
      id: "commit",
      title: "Commit",
      description: "Git push changes",
      position: { x: 350, y: 150 }
    },
    {
      id: "build",
      title: "Build",
      description: "Test & compile",
      position: { x: 550, y: 250 }
    },
    {
      id: "deploy",
      title: "Deploy",
      description: "Production release",
      position: { x: 750, y: 150 }
    }
  ]}
/>

## 6. Version Diff Component

Git-style code comparison:

```jsx
<VersionDiff
  fileName="config.ts"
  oldVersion={`export default {
  debug: false,
  database: {
    host: "localhost",
    port: 5432
  },
  cache: {
    ttl: 300
  }
}`}
  newVersion={`export default {
  debug: true, // Changed for development
  database: {
    host: "prod-db.example.com",
    port: 5432,
    ssl: true // Added SSL support
  },
  cache: {
    ttl: 3600, // Increased to 1 hour
    maxSize: 1000 // Added memory limit
  }
}`}
/>
```

<VersionDiff
  fileName="config.ts"
  oldVersion={`export default {
  debug: false,
  database: {
    host: "localhost",
    port: 5432
  },
  cache: {
    ttl: 300
  }
}`}
  newVersion={`export default {
  debug: true, // Changed for development
  database: {
    host: "prod-db.example.com",
    port: 5432,
    ssl: true // Added SSL support
  },
  cache: {
    ttl: 3600, // Increased to 1 hour
    maxSize: 1000 // Added memory limit
  }
}`}
/>

## 7. Tool List Component

Filterable tool directory:

```jsx
import ToolList from "@/components/mdx/ToolList";

<ToolList
  tools={[
    {
      name: "React",
      description: "A JavaScript library for building user interfaces",
      category: "Framework",
      tags: ["UI", "Component", "Frontend"],
      link: "https://react.dev",
      rating: 4.8,
      featured: true
    },
    {
      name: "Next.js",
      description: "The React framework for web development",
      category: "Framework",
      tags: ["SSR", "RSC", "Fullstack"],
      link: "https://nextjs.org",
      rating: 4.7,
      featured: true
    },
    {
      name: "Tailwind CSS",
      description: "A utility-first CSS framework",
      category: "Styling",
      tags: ["CSS", "Design", "Utility"],
      link: "https://tailwindcss.com",
      rating: 4.6
    },
    {
      name: "PostgreSQL",
      description: "The world's most advanced open source database",
      category: "Database",
      tags: ["SQL", "Data", "Backend"],
      link: "https://www.postgresql.org",
      rating: 4.9
    },
    {
      name: "Prisma",
      description: "Next-generation ORM for Node.js and TypeScript",
      category: "Database",
      tags: ["ORM", "TypeScript", "Database"],
      link: "https://www.prisma.io",
      rating: 4.4
    },
    {
      name: "Vite",
      description: "Next Generation Frontend Tooling",
      category: "Build Tool",
      tags: ["Build", "Dev Server", "Fast"],
      link: "https://vitejs.dev",
      rating: 4.5,
      featured: true
    }
  ]}
/>
```

<details>
<summary>Interactive Tool List</summary>

import ToolList from "@/components/mdx/ToolList";

<ToolList
  tools={[
    {
      name: "React",
      description: "A JavaScript library for building user interfaces",
      category: "Framework",
      tags: ["UI", "Component", "Frontend"],
      link: "https://react.dev",
      rating: 4.8,
      featured: true
    },
    {
      name: "Next.js",
      description: "The React framework for web development",
      category: "Framework",
      tags: ["SSR", "RSC", "Fullstack"],
      link: "https://nextjs.org",
      rating: 4.7,
      featured: true
    },
    {
      name: "Tailwind CSS",
      description: "A utility-first CSS framework",
      category: "Styling",
      tags: ["CSS", "Design", "Utility"],
      link: "https://tailwindcss.com",
      rating: 4.6
    },
    {
      name: "PostgreSQL",
      description: "The world's most advanced open source database",
      category: "Database",
      tags: ["SQL", "Data", "Backend"],
      link: "https://www.postgresql.org",
      rating: 4.9
    },
    {
      name: "Prisma",
      description: "Next-generation ORM for Node.js and TypeScript",
      category: "Database",
      tags: ["ORM", "TypeScript", "Database"],
      link: "https://www.prisma.io",
      rating: 4.4
    },
    {
      name: "Vite",
      description: "Next Generation Frontend Tooling",
      category: "Build Tool",
      tags: ["Build", "Dev Server", "Fast"],
      link: "https://vitejs.dev",
      rating: 4.5,
      featured: true
    }
  ]}
/>

</details>

## Conclusion

MDX opens up a world of possibilities for interactive blog content. You can:

- **Embed rich visualizations** with data
- **Create interactive tools** for your readers
- **Make comparisons** more engaging
- **Build custom components** for specific use cases

This enhances the reading experience and provides value beyond static text. All components are built with React and can be customized further.

**What components would you like to see next?** Let me know in the comments!