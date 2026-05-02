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
        'prose-a[href^="https://"]:after:content-["↗︎"] prose dark:prose-invert prose-code:break-words',
        "prose-h1:font-serif prose-h1:tracking-tight",
        "mb-10 mt-10 max-w-none"
      )}
    >
      <MDXContent components={mdxComponents} />
    </article>
  );
}

export default function Content({ post }: { post: ContentPost }) {
  return (
    <>
      <header className="mb-10 flex flex-col gap-5 pt-8 sm:pt-12 md:mb-14">
        <h1
          className={cn(
            "mt-2 inline-block break-words py-2",
            "text-neutral-950 dark:text-[#f8f8f2]",
            "text-4xl font-semibold leading-[0.98] tracking-tight",
            "md:text-5xl",
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
            'prose-a[href^="https://"]:after:content-["↗︎"] prose dark:prose-invert prose-code:break-words',
            "prose-h1:font-serif prose-h1:tracking-tight",
            "mb-10 mt-10 max-w-none prose-lg prose-p:leading-8 prose-p:text-neutral-800 dark:prose-p:text-[#f8f8f2]/80"
          )}
          dangerouslySetInnerHTML={{ __html: post.content || "No content" }}
        />
      )}

      <Snippet html={post.snippet || ""} />
    </>
  );
}
