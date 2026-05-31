import type { Post } from "@duyet/interfaces";
import type { TOCItem } from "@duyet/libs/extractHeadings";
import { cn } from "@duyet/libs/utils";
import { compile, run } from "@mdx-js/mdx";
import { Fragment, use } from "react";
import * as runtime from "react/jsx-runtime";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

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

// Shared editorial prose classes — narrow measure, generous leading.
// CSS in `styles/post-reader.css` (scoped under `.post-reader`) controls
// font family, sizing, and colour; here we just keep table/pre overflow
// behaviour and let prose hooks pick up the rest.
const proseClassName = cn(
  "prose dark:prose-invert",
  "max-w-none",
  "[&>table]:overflow-x-auto [&>table]:sm:-mx-4 [&>table]:lg:-mx-8",
  "[&>pre]:overflow-x-auto",
  "prose-table:text-sm prose-table:leading-relaxed prose-table:table-auto"
);

function MDXRenderer({ source }: { source: string }) {
  if (!mdxCache.has(source)) {
    mdxCache.set(source, compileMDX(source));
  }

  const MDXContent = use(mdxCache.get(source)!);

  return (
    <article className={proseClassName}>
      <MDXContent components={mdxComponents} />
    </article>
  );
}

export default function Content({ post }: { post: ContentPost }) {
  return (
    <>
      <OldPostWarning post={post} year={5} className="mb-6" />

      {post.isMDX && post.mdxSource ? (
        <MDXRenderer source={post.mdxSource} />
      ) : (
        <article
          className={proseClassName}
          dangerouslySetInnerHTML={{ __html: post.content || "No content" }}
        />
      )}

      <Snippet html={post.snippet || ""} />
    </>
  );
}
