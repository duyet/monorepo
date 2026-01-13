"use client";

import React from "react";
import dynamic from "next/dynamic";
import { MDXProvider } from "@mdx-js/react";
import { MDXRemote, MDXRemoteProps } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import { useEffect, useState } from "react";
import type { Post } from "@duyet/interfaces";

// Import custom MDX components dynamically
const ToolComparison = dynamic(() => import("./MDX/ToolComparison"));
const FeatureMatrix = dynamic(() => import("./MDX/FeatureMatrix"));
const WakaTimeChart = dynamic(() => import("./MDX/WakaTimeChart"));
const ToolTimeline = dynamic(() => import("./MDX/ToolTimeline"));
const WorkflowDiagram = dynamic(() => import("./MDX/WorkflowDiagram"));
const VersionDiff = dynamic(() => import("./MDX/VersionDiff"));
const ToolList = dynamic(() => import("./MDX/ToolList"));

interface MDXContentProps {
  post: Post;
}

// Custom MDX components mapping
const components = {
  // Interactive MDX Components
  ToolComparison,
  FeatureMatrix,
  WakaTimeChart,
  ToolTimeline,
  WorkflowDiagram,
  VersionDiff,
  ToolList,

  // HTML element overrides
  h1: ({ children, ...props }: any) => (
    <h1 className="text-4xl font-bold mt-8 mb-4 text-gray-900 dark:text-gray-100" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: any) => (
    <h2 className="text-3xl font-bold mt-6 mb-3 text-gray-900 dark:text-gray-100" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: any) => (
    <h3 className="text-2xl font-semibold mt-5 mb-2 text-gray-900 dark:text-gray-100" {...props}>
      {children}
    </h3>
  ),
  p: ({ children, ...props }: any) => (
    <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed" {...props}>
      {children}
    </p>
  ),
  a: ({ children, ...props }: any) => (
    <a
      className="text-blue-600 dark:text-blue-400 hover:underline decoration-blue-500 dark:decoration-blue-400"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  ),
  ul: ({ children, ...props }: any) => (
    <ul className="list-disc list-inside mb-4 space-y-1 text-gray-700 dark:text-gray-300" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: any) => (
    <ol className="list-decimal list-inside mb-4 space-y-1 text-gray-700 dark:text-gray-300" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: any) => (
    <li className="pl-1" {...props}>
      {children}
    </li>
  ),
  blockquote: ({ children, ...props }: any) => (
    <blockquote
      className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-4 italic text-gray-600 dark:text-gray-400"
      {...props}
    >
      {children}
    </blockquote>
  ),
  code: ({ children, ...props }: any) => (
    <code
      className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-gray-900 dark:text-gray-100"
      {...props}
    >
      {children}
    </code>
  ),
  pre: ({ children, ...props }: any) => (
    <pre
      className="bg-gray-900 dark:bg-gray-950 text-gray-100 dark:text-gray-100 p-4 rounded-lg overflow-x-auto my-4 border border-gray-700 dark:border-gray-800"
      {...props}
    >
      {children}
    </pre>
  ),
  table: ({ children, ...props }: any) => (
    <table
      className="w-full border-collapse mb-4 text-sm text-gray-700 dark:text-gray-300"
      {...props}
    >
      {children}
    </table>
  ),
  thead: ({ children, ...props }: any) => (
    <thead className="bg-gray-100 dark:bg-gray-800 border-b-2 border-gray-300 dark:border-gray-600" {...props}>
      {children}
    </thead>
  ),
  tbody: ({ children, ...props }: any) => (
    <tbody className="divide-y divide-gray-200 dark:divide-gray-700" {...props}>
      {children}
    </tbody>
  ),
  tr: ({ children, ...props }: any) => (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50" {...props}>
      {children}
    </tr>
  ),
  th: ({ children, ...props }: any) => (
    <th className="px-4 py-2 text-left font-semibold text-gray-900 dark:text-gray-100" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }: any) => (
    <td className="px-4 py-2" {...props}>
      {children}
    </td>
  ),
  img: ({ children, ...props }: any) => (
    <img className="rounded-lg my-4 max-w-full" {...props}>
      {children}
    </img>
  ),
  hr: ({ children, ...props }: any) => (
    <hr className="border-t-2 border-gray-200 dark:border-gray-700 my-6" {...props}>
      {children}
    </hr>
  ),
};

/**
 * MDXContent - Renders MDX content with interactive components
 * Uses next-mdx-remote for client-side hydration of MDX
 */
export default function MDXContent({ post }: MDXContentProps) {
  const [mdxSource, setMdxSource] = useState<MDXRemoteProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMDX = async () => {
      try {
        if (!post.markdown_content) {
          setError("No content to render");
          return;
        }

        // Serialize the MDX content
        const source = await serialize(post.markdown_content, {
          mdxOptions: {
            remarkPlugins: [],
            rehypePlugins: [],
          },
          parseFrontmatter: true,
        });

        setMdxSource(source);
      } catch (err) {
        console.error("MDX Serialization error:", err);
        setError(err instanceof Error ? err.message : "Failed to parse MDX content");
      } finally {
        setLoading(false);
      }
    };

    loadMDX();
  }, [post.markdown_content]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-pulse text-gray-500">Loading MDX content...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
        <h3 className="font-bold mb-2">MDX Rendering Error</h3>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!mdxSource) {
    return null;
  }

  return (
    <MDXProvider components={components}>
      <article className="prose prose-lg max-w-none dark:prose-invert">
        <MDXRemote {...mdxSource} components={components} />
      </article>
    </MDXProvider>
  );
}