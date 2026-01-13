import type { Post } from "@duyet/interfaces";
import { markdownToHtml, serializeMDX, getPostBySlug } from "@duyet/libs";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Suspense } from "react";

// Import MDX components - these are used within the MDX content
import { ToolComparison, FeatureMatrix, WakaTimeChart, ToolTimeline, WorkflowDiagram, VersionDiff, ToolList, FuzzyToolList } from "../../../../components/mdx";

// Recharts imports for MDX components
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell
} from "recharts";

// Next.js components for MDX
import Link from "next/link";
import Image from "next/image";

import "katex/dist/contrib/mhchem.min.js";
import "katex/dist/katex.min.css";

interface MDXContentProps {
  post: Post;
  className?: string;
}

// MDX component mapping
const mdxComponents = {
  // Interactive components
  ToolComparison,
  FeatureMatrix,
  WakaTimeChart,
  ToolTimeline,
  WorkflowDiagram,
  VersionDiff,
  ToolList,
  FuzzyToolList,

  // Recharts components
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,

  // Next.js components
  Link,
  Image,
};

export async function MDXContent({ post, className }: MDXContentProps) {
  // Check if this is an MDX post
  if (post.isMDX && post.rawContent) {
    // Serialize the MDX content
    const source = await serializeMDX(post.rawContent);

    return (
      <article
        className={`prose-a[href^="https://"]:after:content-["↗︎"] prose dark:prose-invert prose-code:break-words mb-10 mt-10 max-w-none ${className}`}
      >
        <Suspense fallback={<div>Loading MDX content...</div>}>
          <MDXRemote source={source} components={mdxComponents} />
        </Suspense>
      </article>
    );
  }

  // Fallback to regular markdown rendering
  const html = post.content || "No content";
  return (
    <article
      className={`prose-a[href^="https://"]:after:content-["↗︎"] prose dark:prose-invert prose-code:break-words mb-10 mt-10 max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

interface ContentProps {
  post: Post;
}

export default async function Content({ post }: ContentProps) {
  return (
    <>
      <header className="mb-8 flex flex-col gap-4">
        <h1 className="mt-2 inline-block break-words py-2 font-serif text-neutral-900 dark:text-neutral-100 text-4xl font-bold tracking-normal md:text-5xl md:tracking-tight lg:text-6xl lg:tracking-tight">
          {post.title}
        </h1>

        <div className="text-sm text-gray-500 dark:text-gray-400 flex gap-4 items-center">
          <span>{post.date.toLocaleDateString()}</span>
          <span>•</span>
          <span>{post.category}</span>
          {post.isMDX && (
            <>
              <span>•</span>
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded">MDX</span>
            </>
          )}
        </div>
      </header>

      <MDXContent post={post} />

      {post.snippet && (
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-400">Snippet</h3>
          <div className="text-sm font-mono">{post.snippet}</div>
        </div>
      )}
    </>
  );
}

export async function getPost(slug: string[]) {
  const post = getPostBySlug(slug.join("/"), [
    "slug",
    "title",
    "excerpt",
    "date",
    "content",
    "category",
    "category_slug",
    "tags",
    "series",
    "snippet",
    "fileType",
    "isMDX",
    "rawContent",
  ]);

  // If it's an MDX post, we need to process it differently
  if (post.isMDX) {
    // For MDX, we'll serialize the content in the component
    return {
      ...post,
      content: "", // Don't pre-process MDX content
      markdown_content: post.rawContent,
      edit_url: getGithubEditUrl(post.slug, post.fileType),
    };
  }

  // For regular .md files, use the existing markdown processor
  const markdownContent = post.content || "Error";
  const content = await markdownToHtml(markdownContent);

  return {
    ...post,
    content,
    markdown_content: markdownContent,
    edit_url: getGithubEditUrl(post.slug, post.fileType),
  };
}

const getGithubEditUrl = (slug: string, fileType?: string) => {
  const extension = fileType === "mdx" ? ".mdx" : ".md";
  const file = slug.replace(/\.md|\.mdx|\.html|\.htm$/, "").replace(/^\/?/, "");
  const repoUrl =
    process.env.NEXT_PUBLIC_GITHUB_REPO_URL ||
    "https://github.com/duyet/monorepo";
  return `${repoUrl}/edit/master/apps/blog/_posts/${file}${extension}`;
};