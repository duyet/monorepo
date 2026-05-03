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
        "prose-headings:text-[#1a1a1a] dark:prose-headings:text-[#f8f8f2]",
        "prose-headings:font-semibold prose-headings:tracking-tight",
        "prose-p:text-[#1a1a1a]/80 dark:prose-p:text-[#f8f8f2]/80",
        "prose-a:text-[#1a1a1a] dark:prose-a:text-[#f8f8f2]",
        "prose-a:underline prose-a:underline-offset-4",
        "prose-strong:text-[#1a1a1a] dark:prose-strong:text-[#f8f8f2]",
        "prose-code:break-words"
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
            "text-[#1a1a1a] dark:text-[#f8f8f2]",
            "text-4xl font-semibold leading-[1.05] tracking-tight",
            "sm:text-5xl",
            "lg:text-6xl"
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
            "prose-headings:text-[#1a1a1a] dark:prose-headings:text-[#f8f8f2]",
            "prose-headings:font-semibold prose-headings:tracking-tight",
            "prose-p:text-[#1a1a1a]/80 dark:prose-p:text-[#f8f8f2]/80",
            "prose-p:leading-8",
            "prose-a:text-[#1a1a1a] dark:prose-a:text-[#f8f8f2]",
            "prose-a:underline prose-a:underline-offset-4",
            "prose-strong:text-[#1a1a1a] dark:prose-strong:text-[#f8f8f2]",
            "prose-code:break-words"
          )}
          dangerouslySetInnerHTML={{ __html: post.content || "No content" }}
        />
      )}

      <Snippet html={post.snippet || ""} />
    </>
  );
}
