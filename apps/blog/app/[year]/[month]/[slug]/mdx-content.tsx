"use client";

import { useState, useEffect } from "react";
import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import type { Post } from "@duyet/interfaces";

// Components that can be used in MDX
import { ToolComparison, FeatureMatrix, WakaTimeChart, ToolTimeline, WorkflowDiagram, VersionDiff, VersionDiffMulti, ToolList } from "@/components/interactive";

// Import plugins for MDX serialization
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";

interface MDXContentProps {
  post: Post & { path?: string };
}

const components = {
  // Interactive components
  ToolComparison,
  FeatureMatrix,
  WakaTimeChart,
  ToolTimeline,
  WorkflowDiagram,
  VersionDiff,
  VersionDiffMulti,
  ToolList,

  // HTML element overrides
  h1: ({ children, ...props }: any) => (
    <h1 className="text-4xl font-bold mt-8 mb-4" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: any) => (
    <h2 className="text-3xl font-bold mt-6 mb-3" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: any) => (
    <h3 className="text-2xl font-bold mt-5 mb-2" {...props}>
      {children}
    </h3>
  ),
  p: ({ children, ...props }: any) => (
    <p className="text-base text-gray-700 dark:text-gray-300 mb-4" {...props}>
      {children}
    </p>
  ),
  code: ({ children, ...props }: any) => (
    <code
      className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded font-mono text-sm"
      {...props}
    >
      {children}
    </code>
  ),
  pre: ({ children, ...props }: any) => (
    <pre
      className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm mb-4"
      {...props}
    >
      {children}
    </pre>
  ),
  blockquote: ({ children, ...props }: any) => (
    <blockquote
      className="border-l-4 border-blue-500 pl-4 italic my-4 text-gray-600 dark:text-gray-400"
      {...props}
    >
      {children}
    </blockquote>
  ),
};

export function MDXContent({ post }: MDXContentProps) {
  const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const serializeMDX = async () => {
      if (!post.content) {
        setError("No content available");
        return;
      }

      try {
        const serialized = await serialize(post.content, {
          parseFrontmatter: true,
          mdxOptions: {
            remarkPlugins: [remarkGfm, remarkMath],
            rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings, rehypeKatex, rehypeHighlight],
          },
        });
        setMdxSource(serialized);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to serialize MDX");
      }
    };

    serializeMDX();
  }, [post.content]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
        <strong>MDX Render Error:</strong> {error}
      </div>
    );
  }

  if (!mdxSource) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      </div>
    );
  }

  return (
    <article className="max-w-none">
      <MDXRemote {...mdxSource} components={components} />
    </article>
  );
}