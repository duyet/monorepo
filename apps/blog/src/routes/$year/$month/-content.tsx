import type { Post } from "@duyet/interfaces";
import type { TOCItem } from "@duyet/libs/extractHeadings";
import { cn } from "@duyet/libs/utils";
import { compile, run } from "@mdx-js/mdx";
import { Fragment, use } from "react";
import * as runtime from "react/jsx-runtime";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import { common } from "lowlight";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import "katex/dist/contrib/mhchem.min.js";
import "katex/dist/katex.min.css";
import "@/styles/highlight.css";
import { mdxComponents } from "@/components/MdxComponents";
import { LiveWidget } from "../../../components/LiveWidget";
import { OldPostWarning } from "./-old-post-warning";
import { Snippet } from "./-snippet";

interface ContentPost extends Post {
  isMDX?: boolean;
  mdxSource?: string;
  headings?: TOCItem[];
  markdown_content?: string;
  edit_url?: string;
  widgets?: Record<string, string>;
}

interface MDXContentProps {
  components?: typeof mdxComponents;
}

// MDX compiled component cache
const mdxCache = new Map<
  string,
  Promise<React.ComponentType<MDXContentProps>>
>();

// Minimal hljs grammar for ```prompt blocks: highlights /slash-commands only.
// Factory: lowlight/highlight.js register a language by calling it as
// `(hljs) => definition`, so a bare object throws at registration
// ("languageDefinition is not a function") and crashes every .mdx post.
const promptLanguage = (): { name: string; disableAutodetect: boolean; case_insensitive: boolean; contains: { scope: string; begin: RegExp }[] } => ({
  name: "prompt",
  disableAutodetect: true,
  case_insensitive: false,
  contains: [{ scope: "built_in", begin: /^\/[A-Za-z][\w:-]*/ }],
});

// Built once: every common grammar (ts, bash, sh, …) plus the custom `prompt`.
// `languages` overrides rehype-highlight's default set, so `common` must be
// merged in rather than passed alone.
const highlightLanguages = { ...common, prompt: promptLanguage };

async function compileMDX(
  source: string
): Promise<React.ComponentType<MDXContentProps>> {
  const code = await compile(source, {
    outputFormat: "function-body",
    remarkPlugins: [remarkGfm, remarkMath],
    rehypePlugins: [
      rehypeSlug,
      rehypeKatex,
      // Only highlight blocks with an explicit language: with every common
      // grammar registered, autodetect mis-colours plain blocks (an ascii tree
      // becomes "graphql"), so detection stays off.
      [rehypeHighlight, { detect: false, languages: highlightLanguages }],
    ],
  });

  const { default: MDXContent } = await run(String(code), {
    ...runtime,
    Fragment,
    baseUrl: import.meta.url,
  });

  return MDXContent as React.ComponentType<MDXContentProps>;
}

// Shared editorial typeset classes — narrow measure, generous leading, and
// token-driven theming are handled by typeset.css (`.typeset .typeset-blog`)
// plus the `.post-reader` layout grid in styles/post-reader.css. Here we only
// keep table/pre overflow behaviour and let the renderer pick up the rest.
const typesetClassName = cn(
  "typeset typeset-blog",
  "max-w-none",
  "[&>table]:overflow-x-auto [&>table]:sm:-mx-4 [&>table]:lg:-mx-8",
  "[&>pre]:overflow-x-auto"
);

function MDXRenderer({ source }: { source: string }) {
  if (!mdxCache.has(source)) {
    mdxCache.set(source, compileMDX(source));
  }

  const MDXContent = use(mdxCache.get(source)!);

  return (
    <article className={typesetClassName}>
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
          className={typesetClassName}
          dangerouslySetInnerHTML={{ __html: post.content || "No content" }}
        />
      )}

      {/* Render inline widgets */}
      {post.widgets &&
        Object.entries(post.widgets).map(([widgetId, widgetHtml]) => (
          <LiveWidget
            key={widgetId}
            html={widgetHtml}
            title={`Widget: ${widgetId}`}
            className="my-8"
          />
        ))}

      <Snippet html={post.snippet || ""} />
    </>
  );
}
