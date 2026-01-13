import type { MDXComponents } from "mdx/types";
import {
  ToolComparison,
  FeatureMatrix,
  WakaTimeChart,
  ToolTimeline,
  WorkflowDiagram,
  VersionDiff,
  ToolList,
} from "../components/interactive";

/**
 * MDX Components
 * These components are automatically available in all MDX files
 * without needing to import them
 */
export const components: MDXComponents = {
  // Interactive components
  ToolComparison,
  FeatureMatrix,
  WakaTimeChart,
  ToolTimeline,
  WorkflowDiagram,
  VersionDiff,
  ToolList,

  // Standard HTML elements (optional overrides)
  h1: ({ children, ...props }) => (
    <h1 className="text-3xl font-bold mt-8 mb-4" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="text-2xl font-bold mt-6 mb-3" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="text-xl font-bold mt-4 mb-2" {...props}>
      {children}
    </h3>
  ),
  p: ({ children, ...props }) => (
    <p className="my-3 leading-relaxed" {...props}>
      {children}
    </p>
  ),
  code: ({ children, ...props }) => (
    <code
      className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded font-mono text-sm"
      {...props}
    >
      {children}
    </code>
  ),
  pre: ({ children, ...props }) => (
    <pre
      className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4"
      {...props}
    >
      {children}
    </pre>
  ),
};

export default components;