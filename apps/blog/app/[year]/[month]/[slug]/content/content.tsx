import type { Post } from "@duyet/interfaces";
import { getPostBySlug } from "@duyet/libs/getPost";
import { markdownToHtml } from "@duyet/libs/markdownToHtml";
import { cn } from "@duyet/libs/utils";

import "katex/dist/contrib/mhchem.min.js";
import "katex/dist/katex.min.css";
import { OldPostWarning } from "./old-post-warning";
import { Snippet } from "./snippet";
import { Suspense } from "react";

// Async MDX renderer for server-side processing
async function MDXContent({ content }: { content: string }) {
  // The markdownToHtml now handles MDX conversion for display
  // This provides an enhanced wrapper for MDX content
  return (
    <article
      className={cn(
        'prose-a[href^="https://"]:after:content-["↗︎"] prose dark:prose-invert prose-code:break-words',
        "mb-10 mt-10 max-w-none",
        // Special styling for MDX components
        "[&_.mdx-component]:border [&_.mdx-component]:rounded-lg",
        "[&_.mdx-component]:my-4",
        "[&_.mdx-component]:p-4",
        "[&_.mdx-component]:bg-muted/20"
      )}
      dangerouslySetInnerHTML={{ __html: content || "No content" }}
    />
  );
}

// Wrapper to handle both MDX and regular markdown
const MDXRenderer = ({ content, isMDX }: { content: string; isMDX: boolean }) => {
  if (isMDX) {
    // For MDX, we need special handling - use Suspense for any async operations
    return (
      <Suspense fallback={<div className="animate-pulse">Loading MDX content...</div>}>
        <MDXContent content={content} />
      </Suspense>
    );
  }

  return (
    <article
      className={cn(
        'prose-a[href^="https://"]:after:content-["↗︎"] prose dark:prose-invert prose-code:break-words',
        "mb-10 mt-10 max-w-none"
      )}
      dangerouslySetInnerHTML={{ __html: content || "No content" }}
    />
  );
};

export default function Content({ post }: { post: Post }) {
  return (
    <>
      <header className="mb-8 flex flex-col gap-4">
        <h1
          className={cn(
            "mt-2 inline-block break-words py-2",
            "font-serif text-neutral-900 dark:text-neutral-100",
            "text-4xl font-bold tracking-normal",
            "md:text-5xl md:tracking-tight",
            "lg:text-6xl lg:tracking-tight"
          )}
        >
          {post.title}
        </h1>

        <OldPostWarning post={post} year={5} className="" />
      </header>

      <MDXRenderer content={post.content || ""} isMDX={post.extension === "mdx"} />

      <Snippet html={post.snippet || ""} />
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
    "extension",
  ]);
  const markdownContent = post.content || "Error";
  const content = await markdownToHtml(markdownContent, {
    isMDX: post.extension === "mdx",
  });

  return {
    ...post,
    content,
    markdown_content: markdownContent,
    edit_url: getGithubEditUrl(post.slug),
  };
}

const getGithubEditUrl = (slug: string) => {
  // Extract extension from slug if present
  const hasMdx = slug.endsWith(".mdx");
  const extension = hasMdx ? ".mdx" : ".md";
  const file = slug.replace(/\.mdx|\.md|\.html|\.htm$/, "").replace(/^\/?/, "") + extension;
  const repoUrl =
    process.env.NEXT_PUBLIC_GITHUB_REPO_URL ||
    "https://github.com/duyet/monorepo";
  return `${repoUrl}/edit/master/apps/blog/_posts/${file}`;
};
