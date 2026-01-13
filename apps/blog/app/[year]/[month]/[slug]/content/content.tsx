import type { Post } from "@duyet/interfaces";
import { getPostBySlug } from "@duyet/libs/getPost";
import { markdownToHtml, extractFrontmatter } from "@duyet/libs/markdownToHtml";
import { cn } from "@duyet/libs/utils";
import { compileMDX } from "next-mdx-remote/rsc";

import "katex/dist/contrib/mhchem.min.js";
import "katex/dist/katex.min.css";
import { OldPostWarning } from "./old-post-warning";
import { Snippet } from "./snippet";
import components from "../../../mdx-components";

interface ContentProps {
  post: Post & { extension?: "md" | "mdx" };
}

export default async function Content({ post }: ContentProps) {
  const isMDX = post.extension === "mdx";

  if (isMDX && post.content) {
    // For MDX files, compile and render
    const { content: compiledContent } = await compileMDX({
      source: post.content,
      components,
      options: {
        parseFrontmatter: true,
        mdxOptions: {
          remarkPlugins: ["remark-gfm", "remark-math"],
          rehypePlugins: [
            "rehype-slug",
            "rehype-autolink-headings",
            "rehype-highlight",
            "rehype-katex",
          ],
        },
      },
    });

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

        <article
          className={cn(
            'prose-a[href^="https://"]:after:content-["↗︎"] prose dark:prose-invert prose-code:break-words',
            "mb-10 mt-10 max-w-none"
          )}
        >
          {compiledContent}
        </article>

        <Snippet html={post.snippet || ""} />
      </>
    );
  }

  // Original markdown handling
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

      <article
        className={cn(
          'prose-a[href^="https://"]:after:content-["↗︎"] prose dark:prose-invert prose-code:break-words',
          "mb-10 mt-10 max-w-none"
        )}
        dangerouslySetInnerHTML={{ __html: post.content || "No content" }}
      />

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

  // For MDX files, we don't need to convert to HTML
  // The content will be compiled by compileMDX in the component
  if (post.extension === "mdx") {
    return {
      ...post,
      edit_url: getGithubEditUrl(post.slug, "mdx"),
    };
  }

  // For MD files, convert to HTML
  const markdownContent = post.content || "Error";
  const content = await markdownToHtml(markdownContent);

  return {
    ...post,
    content,
    markdown_content: markdownContent,
    edit_url: getGithubEditUrl(post.slug, "md"),
  };
}

const getGithubEditUrl = (slug: string, extension: string = "md") => {
  const file = slug.replace(/\.md|\.mdx|\.html|\.htm$/, "").replace(/^\/?/, "");
  const repoUrl =
    process.env.NEXT_PUBLIC_GITHUB_REPO_URL ||
    "https://github.com/duyet/monorepo";
  return `${repoUrl}/edit/master/apps/blog/_posts/${file}.${extension}`;
};
