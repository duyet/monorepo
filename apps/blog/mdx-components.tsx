import type { MDXComponents } from 'mdx/types';
import {
  ToolComparison,
  FeatureMatrix,
  WakaTimeChart,
  ToolTimeline,
  WorkflowDiagram,
  VersionDiff,
  ToolList,
} from './components/mdx';

// Global components available in all MDX files
export const components: MDXComponents = {
  // Interactive components
  ToolComparison,
  FeatureMatrix,
  WakaTimeChart,
  ToolTimeline,
  WorkflowDiagram,
  VersionDiff,
  ToolList,

  // Standard HTML elements with custom styles
  h1: ({ children, ...props }) => (
    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4 tracking-tight">
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-3">
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-2">
      {children}
    </h3>
  ),
  p: ({ children, ...props }) => (
    <p className="text-gray-700 dark:text-gray-300 my-3 leading-relaxed">
      {children}
    </p>
  ),
  code: ({ children, ...props }) => (
    <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded font-mono text-sm text-pink-600 dark:text-pink-400">
      {children}
    </code>
  ),
  pre: ({ children, ...props }) => (
    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4 text-sm">
      {children}
    </pre>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 dark:text-gray-400 my-4">
      {children}
    </blockquote>
  ),
  ul: ({ children, ...props }) => (
    <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 dark:text-gray-300 my-3">
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="list-decimal list-inside ml-4 space-y-1 text-gray-700 dark:text-gray-300 my-3">
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="pl-1">{children}</li>
  ),
  a: ({ children, href, ...props }) => (
    <a
      href={href}
      className="text-blue-600 dark:text-blue-400 hover:underline underline-offset-2"
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      {...props}
    >
      {children}
    </a>
  ),
};
