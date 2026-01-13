"use client";

import React from "react";
import dynamic from "next/dynamic";
import type { MDXComponents } from "mdx/types";

// Import all interactive MDX components
const ToolComparison = dynamic(() => import("./ToolComparison"));
const FeatureMatrix = dynamic(() => import("./FeatureMatrix"));
const WakaTimeChart = dynamic(() => import("./WakaTimeChart"));
const ToolTimeline = dynamic(() => import("./ToolTimeline"));
const WorkflowDiagram = dynamic(() => import("./WorkflowDiagram"));
const VersionDiff = dynamic(() => import("./VersionDiff"));
const ToolList = dynamic(() => import("./ToolList"));

/**
 * Custom MDX components mapping for use with @mdx-js/react
 * Includes both custom interactive components and HTML element overrides
 */
export const components: MDXComponents = {
  // Interactive MDX Components
  ToolComparison,
  FeatureMatrix,
  WakaTimeChart,
  ToolTimeline,
  WorkflowDiagram,
  VersionDiff,
  ToolList,

  // HTML element overrides for better styling
  h1: ({ children, ...props }) => (
    <h1 className="text-4xl font-bold mt-8 mb-4 text-gray-900 dark:text-gray-100" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="text-3xl font-bold mt-6 mb-3 text-gray-900 dark:text-gray-100" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="text-2xl font-semibold mt-5 mb-2 text-gray-900 dark:text-gray-100" {...props}>
      {children}
    </h3>
  ),
  p: ({ children, ...props }) => (
    <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed" {...props}>
      {children}
    </p>
  ),
  a: ({ children, ...props }) => (
    <a
      className="text-blue-600 dark:text-blue-400 hover:underline decoration-blue-500 dark:decoration-blue-400"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  ),
  ul: ({ children, ...props }) => (
    <ul className="list-disc list-inside mb-4 space-y-1 text-gray-700 dark:text-gray-300" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="list-decimal list-inside mb-4 space-y-1 text-gray-700 dark:text-gray-300" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="pl-1" {...props}>
      {children}
    </li>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-4 italic text-gray-600 dark:text-gray-400"
      {...props}
    >
      {children}
    </blockquote>
  ),
  code: ({ children, ...props }) => (
    <code
      className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-gray-900 dark:text-gray-100"
      {...props}
    >
      {children}
    </code>
  ),
  pre: ({ children, ...props }) => (
    <pre
      className="bg-gray-900 dark:bg-gray-950 text-gray-100 dark:text-gray-100 p-4 rounded-lg overflow-x-auto my-4 border border-gray-700 dark:border-gray-800"
      {...props}
    >
      {children}
    </pre>
  ),
  table: ({ children, ...props }) => (
    <table
      className="w-full border-collapse mb-4 text-sm text-gray-700 dark:text-gray-300"
      {...props}
    >
      {children}
    </table>
  ),
  thead: ({ children, ...props }) => (
    <thead className="bg-gray-100 dark:bg-gray-800 border-b-2 border-gray-300 dark:border-gray-600" {...props}>
      {children}
    </thead>
  ),
  tbody: ({ children, ...props }) => (
    <tbody className="divide-y divide-gray-200 dark:divide-gray-700" {...props}>
      {children}
    </tbody>
  ),
  tr: ({ children, ...props }) => (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50" {...props}>
      {children}
    </tr>
  ),
  th: ({ children, ...props }) => (
    <th className="px-4 py-2 text-left font-semibold text-gray-900 dark:text-gray-100" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="px-4 py-2" {...props}>
      {children}
    </td>
  ),
  img: ({ children, ...props }) => (
    <img className="rounded-lg my-4 max-w-full" {...props}>
      {children}
    </img>
  ),
  hr: ({ children, ...props }) => (
    <hr className="border-t-2 border-gray-200 dark:border-gray-700 my-6" {...props}>
      {children}
    </hr>
  ),
};

/**
 * Custom wrapper component for MDX content
 * Provides automatic styling and interactive component support
 */
export function MDXWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="prose prose-lg max-w-none dark:prose-invert">
      {children}
    </div>
  );
}