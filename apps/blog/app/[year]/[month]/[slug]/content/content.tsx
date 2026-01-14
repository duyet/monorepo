import type { Post } from "@duyet/interfaces";
import { getPostBySlug } from "@duyet/libs/getPost";
import { markdownToHtml } from "@duyet/libs/markdownToHtml";
import { cn } from "@duyet/libs/utils";
import { MDXRemote } from "next-mdx-remote-client/rsc";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import "katex/dist/contrib/mhchem.min.js";
import "katex/dist/katex.min.css";
import "@/styles/highlight.css";
import { mdxComponents } from "@/components/MdxComponents";
import { OldPostWarning } from "./old-post-warning";
import { Snippet } from "./snippet";

interface ContentPost extends Post {
  isMDX?: boolean;
  mdxSource?: string;
}

export default async function Content({ post }: { post: ContentPost }) {
  return (
    <>
      <header className="mb-8 flex flex-col gap-4">
        <h1
          className={cn(
            "mt-2 inline-block break-words py-2",
            "font-serif text-neutral-900 dark:text-neutral-100",
            "text-3xl font-bold tracking-normal",
            "md:text-4xl md:tracking-tight",
            "lg:text-5xl lg:tracking-tight"
          )}
        >
          {post.title}
        </h1>

        <OldPostWarning post={post} year={5} className="" />
      </header>

      {post.isMDX && post.mdxSource ? (
        <article
          className={cn(
            'prose-a[href^="https://"]:after:content-["↗︎"] prose dark:prose-invert prose-code:break-words',
            "prose-h1:font-serif prose-h1:tracking-tight",
            "mb-10 mt-10 max-w-none"
          )}
        >
          <MDXRemote
            source={post.mdxSource}
            components={mdxComponents}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm, remarkMath],
                rehypePlugins: [rehypeKatex, rehypeHighlight],
              },
            }}
          />
        </article>
      ) : (
        <article
          className={cn(
            'prose-a[href^="https://"]:after:content-["↗︎"] prose dark:prose-invert prose-code:break-words',
            "prose-h1:font-serif prose-h1:tracking-tight",
            "mb-10 mt-10 max-w-none"
          )}
          dangerouslySetInnerHTML={{ __html: post.content || "No content" }}
        />
      )}

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
    "isMDX",
  ]);

  const markdownContent = post.content || "Error";

  // Handle MDX files differently - pass raw source for RSC compilation
  if (post.isMDX) {
    return {
      ...post,
      content: "", // HTML content not used for MDX
      mdxSource: markdownContent, // Pass raw MDX source
      isMDX: true,
      markdown_content: markdownContent,
      edit_url: getGithubEditUrl(post.slug),
    };
  }

  // Regular markdown processing
  const content = await markdownToHtml(markdownContent);

  return {
    ...post,
    content,
    markdown_content: markdownContent,
    edit_url: getGithubEditUrl(post.slug),
  };
}

const getGithubEditUrl = (slug: string) => {
  const file = slug.replace(/\.md|\.html|\.htm$/, ".md").replace(/^\/?/, "");
  const repoUrl =
    process.env.NEXT_PUBLIC_GITHUB_REPO_URL ||
    "https://github.com/duyet/monorepo";
  return `${repoUrl}/edit/master/apps/blog/_posts/${file}`;
};
