/**
 * Example usage of the ToolList component
 *
 * This file demonstrates how to use the ToolList component with sample data.
 */

import { ToolList } from "./ToolList";
import type { Tool } from "./types";

// Sample tool data
const SAMPLE_TOOLS: Tool[] = [
  {
    name: "Claude AI",
    category: "AI Coding",
    status: "active",
    rating: 5,
    notes: "Advanced AI assistant for coding tasks",
    dateAdded: "2024-01-15",
  },
  {
    name: "ChatGPT",
    category: "AI Coding",
    status: "active",
    rating: 4,
    notes: "Popular language model for various tasks",
    dateAdded: "2024-01-10",
  },
  {
    name: "TypeScript",
    category: "Framework",
    status: "active",
    rating: 5,
    notes: "Typed superset of JavaScript",
    dateAdded: "2023-06-01",
  },
  {
    name: "React",
    category: "Framework",
    status: "active",
    rating: 5,
    notes: "JavaScript library for building user interfaces",
    dateAdded: "2023-06-01",
  },
  {
    name: "Next.js",
    category: "Framework",
    status: "active",
    rating: 5,
    notes: "React framework with server-side rendering",
    dateAdded: "2023-08-15",
  },
  {
    name: "Vue.js",
    category: "Framework",
    status: "active",
    rating: 4,
    notes: "Progressive JavaScript framework",
    dateAdded: "2023-09-20",
  },
  {
    name: "Tailwind CSS",
    category: "Framework",
    status: "active",
    rating: 5,
    notes: "Utility-first CSS framework",
    dateAdded: "2023-07-10",
  },
  {
    name: "Bun",
    category: "SDK",
    status: "active",
    rating: 4,
    notes: "All-in-one JavaScript runtime",
    dateAdded: "2024-02-01",
  },
  {
    name: "Deno",
    category: "SDK",
    status: "testing",
    rating: 3,
    notes: "Secure runtime for JavaScript and TypeScript",
    dateAdded: "2023-12-15",
  },
  {
    name: "Node.js",
    category: "SDK",
    status: "active",
    rating: 5,
    notes: "JavaScript runtime built on Chrome V8",
    dateAdded: "2023-01-01",
  },
  {
    name: "CommonJS",
    category: "SDK",
    status: "deprecated",
    rating: 2,
    notes: "Legacy module system for Node.js",
    dateAdded: "2022-01-01",
  },
  {
    name: "Angular",
    category: "Framework",
    status: "active",
    rating: 3,
    notes: "Full-featured web application framework",
    dateAdded: "2023-05-01",
  },
  {
    name: "GraphQL",
    category: "SDK",
    status: "active",
    rating: 4,
    notes: "Query language for APIs",
    dateAdded: "2023-11-15",
  },
  {
    name: "REST",
    category: "Other",
    status: "active",
    rating: 4,
    notes: "Standard architectural style for APIs",
    dateAdded: "2023-01-01",
  },
  {
    name: "Webpack",
    category: "Other",
    status: "active",
    rating: 4,
    notes: "Module bundler for JavaScript",
    dateAdded: "2023-03-15",
  },
  {
    name: "Vite",
    category: "Other",
    status: "active",
    rating: 5,
    notes: "Next generation frontend tooling",
    dateAdded: "2024-01-20",
  },
  {
    name: "Parcel",
    category: "Other",
    status: "testing",
    rating: 3,
    notes: "Web application bundler",
    dateAdded: "2023-10-01",
  },
  {
    name: "Rollup",
    category: "Other",
    status: "active",
    rating: 4,
    notes: "JavaScript module bundler",
    dateAdded: "2023-02-01",
  },
  {
    name: "Turbopack",
    category: "Other",
    status: "testing",
    rating: 4,
    notes: "Incremental bundler optimized for JavaScript",
    dateAdded: "2024-01-10",
  },
  {
    name: "SWC",
    category: "Other",
    status: "active",
    rating: 4,
    notes: "Super-fast JavaScript compiler",
    dateAdded: "2023-11-01",
  },
];

/**
 * Basic usage example
 */
export function ToolListBasicExample() {
  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Development Tools</h1>
      <ToolList tools={SAMPLE_TOOLS} />
    </div>
  );
}

/**
 * With custom className
 */
export function ToolListWithCustomClass() {
  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Tools & Technologies</h1>
      <ToolList tools={SAMPLE_TOOLS} className="my-custom-class" />
    </div>
  );
}

/**
 * Filtered example - showing only active tools
 */
export function ToolListActiveOnly() {
  const activeTools = SAMPLE_TOOLS.filter((tool) => tool.status === "active");

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Active Tools</h1>
      <ToolList tools={activeTools} />
    </div>
  );
}

/**
 * Grouped by category example
 */
export function ToolListGroupedByCategory() {
  const categories = Array.from(new Set(SAMPLE_TOOLS.map((t) => t.category)));

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      {categories.map((category) => (
        <div key={category} className="mb-12">
          <h2 className="text-2xl font-bold mb-6">{category}</h2>
          <ToolList
            tools={SAMPLE_TOOLS.filter((tool) => tool.category === category)}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * Dark mode example
 */
export function ToolListDarkMode() {
  return (
    <div className="w-full max-w-7xl mx-auto p-4 bg-gray-950 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-white">Development Tools</h1>
      <ToolList tools={SAMPLE_TOOLS} />
    </div>
  );
}
