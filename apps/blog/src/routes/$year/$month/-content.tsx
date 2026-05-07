import type { Post } from "@duyet/interfaces";
import type { TOCItem } from "@duyet/libs/extractHeadings";
import { cn } from "@duyet/libs/utils";
import { compile, run } from "@mdx-js/mdx";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { Fragment, use } from "react";
import * as runtime from "react/jsx-runtime";

import "katex/dist/contrib/mhchem.min.js";
import "katex/dist/katex.min.css";
import "@/styles/highlight.css";
import { mdxComponents } from "@/components/MdxComponents";
import { OldPostWarning } from "./-old-post-warning";
import { Snippet } from "./-snippet";

interface ContentPost extends Post {
  isMDX?: boolean;
  mdxSource?: string;
  headings?: TOCItem[];
  markdown_content?: string;
  edit_url?: string;
}

interface MDXContentProps {
  components?: typeof mdxComponents;
}

// MDX compiled component cache
const mdxCache = new Map<
  string,
  Promise<React.ComponentType<MDXContentProps>>
>();

async function compileMDX(
  source: string
): Promise<React.ComponentType<MDXContentProps>> {
  const code = await compile(source, {
    outputFormat: "function-body",
    remarkPlugins: [remarkGfm, remarkMath],
    rehypePlugins: [rehypeSlug, rehypeKatex, rehypeHighlight],
  });

  const { default: MDXContent } = await run(String(code), {
    ...runtime,
    Fragment,
    baseUrl: import.meta.url,
  });

  return MDXContent as React.ComponentType<MDXContentProps>;
}

function MDXRenderer({ source }: { source: string }) {
  if (!mdxCache.has(source)) {
    mdxCache.set(source, compileMDX(source));
  }

  const MDXContent = use(mdxCache.get(source)!);

  return (
    <article
      className={cn(
        "prose dark:prose-invert",
        "max-w-none",
        "[&>table]:overflow-x-auto [&>table]:sm:-mx-4 [&>table]:sm:-mx-8 [&>table]:lg:-mx-16 [&>table]:xl:-mx-24",
        "[&>table]:border-t [&>table]:border-b [&>table]:border-[var(--border)] dark:[&>table]:border-white/10",
        "[&>pre]:overflow-x-auto [&>pre]:sm:-mx-4 [&>pre]:sm:-mx-8 [&>pre]:lg:-mx-16 [&>pre]:xl:-mx-24",
        "prose-headings:text-[var(--foreground)]",
        "prose-headings:font-serif prose-headings:font-normal prose-headings:tracking-tight",
        "prose-p:text-[#3d3d3a] dark:prose-p:text-[var(--foreground)]/80",
        "prose-a:text-[var(--accent)] dark:prose-a:text-[var(--accent)]",
        "prose-a:underline prose-a:underline-offset-4",
        "prose-strong:text-[var(--foreground)]",
        "prose-code:break-words",
        "prose-table:text-sm prose-table:leading-relaxed prose-table:table-auto"
      )}
    >
      <MDXContent components={mdxComponents} />
    </article>
  );
}

export default function Content({ post }: { post: ContentPost }) {
  return (
    <>
      <header className="mb-12 flex flex-col gap-5 pt-14 sm:pt-20 lg:pt-24">
        <h1
          className={cn(
            "mt-2 break-words py-2",
            "text-[var(--foreground)]",
            "font-serif",
            "text-[48px] font-normal leading-[1.1] tracking-[-1px]",
            "sm:text-[64px] sm:tracking-[-1.5px]"
          )}
        >
          {post.title}
        </h1>

        <OldPostWarning post={post} year={5} className="" />
      </header>

      {post.isMDX && post.mdxSource ? (
        <MDXRenderer source={post.mdxSource} />
      ) : (
        <article
          className={cn(
            'prose dark:prose-invert',
            "max-w-none",
            "prose-lg",
            "[&>table]:overflow-x-auto [&>table]:sm:-mx-4 [&>table]:sm:-mx-8 [&>table]:lg:-mx-16 [&>table]:xl:-mx-24",
            "[&>table]:border-t [&>table]:border-b [&>table]:border-[var(--border)] dark:[&>table]:border-white/10",
            "[&>pre]:overflow-x-auto [&>pre]:sm:-mx-4 [&>pre]:sm:-mx-8 [&>pre]:lg:-mx-16 [&>pre]:xl:-mx-24",
            "prose-headings:text-[var(--foreground)]",
            "prose-headings:font-serif prose-headings:font-normal prose-headings:tracking-tight",
            "prose-p:text-[#3d3d3a] dark:prose-p:text-[var(--foreground)]/80",
            "prose-p:leading-8",
            "prose-a:text-[var(--accent)] dark:prose-a:text-[var(--accent)]",
            "prose-a:underline prose-a:underline-offset-4",
            "prose-strong:text-[var(--foreground)]",
            "prose-code:break-words",
            "prose-table:text-sm prose-table:leading-relaxed"
          )}
          dangerouslySetInnerHTML={{ __html: post.content || "No content" }}
        />
      )}

      <Snippet html={post.snippet || ""} />
    </>
  );
}
