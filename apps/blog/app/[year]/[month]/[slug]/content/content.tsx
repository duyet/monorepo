import type { Post } from "@duyet/interfaces";
import { getPostBySlug } from "@duyet/libs/getPost";
import { markdownToHtml } from "@duyet/libs/markdownToHtml";
import { markdownToMdx } from "@duyet/libs/markdownToMdx";
import { cn } from "@duyet/libs/utils";

import "katex/dist/contrib/mhchem.min.js";
import "katex/dist/katex.min.css";
import { OldPostWarning } from "./old-post-warning";
import { Snippet } from "./snippet";

// For MDX support
import { MDXRemote } from "next-mdx-remote/rsc";
import * as MDXComponents from "@/components/mdx";

export default async function Content({ post }: { post: Post }) {
  const isMDX = post.path?.endsWith(".mdx");

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

      {isMDX ? (
        /* MDX Content with Interactive Components */
        <article
          className={cn(
            'prose-a[href^="https://"]:after:content-["↗︎"] prose dark:prose-invert prose-code:break-words',
            "mb-10 mt-10 max-w-none"
          )}
        >
          <MDXRemote
            source={post.markdown_content || ""}
            components={MDXComponents as any}
            options={{
              parseFrontmatter: true,
              mdxOptions: {
                remarkPlugins: [
                  require("remark-gfm"),
                  require("remark-math"),
                  require("remark-breaks"),
                ],
                rehypePlugins: [
                  require("rehype-slug"),
                  require("rehype-highlight"),
                  require("rehype-katex"),
                  require("rehype-autolink-headings"),
                ],
              },
            }}
          />
        </article>
      ) : (
        /* Regular Markdown Content */
        <article
          className={cn(
            'prose-a[href^="https://"]:after:content-["↗︎"] prose dark:prose-invert prose-code:break-words',
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
    "path",
  ]);

  const markdownContent = post.content || "Error";
  const isMDX = post.path?.endsWith(".mdx");

  let content: string;
  let markdown_content: string;

  if (isMDX) {
    // For MDX, we provide the raw markdown for MDXRemote to process
    content = ""; // MDX content will be rendered by MDXRemote
    markdown_content = markdownContent;
  } else {
    // For regular markdown, process through markdownToHtml
    content = await markdownToHtml(markdownContent);
    markdown_content = markdownContent;
  }

  return {
    ...post,
    content,
    markdown_content,
    edit_url: getGithubEditUrl(post.slug, isMDX),
  };
}

const getGithubEditUrl = (slug: string, isMDX: boolean = false) => {
  const extension = isMDX ? ".mdx" : ".md";
  const file = slug.replace(/\.md|\.mdx|\.html|\.htm$/, extension).replace(/^\/?/, "");
  const repoUrl =
    process.env.NEXT_PUBLIC_GITHUB_REPO_URL ||
    "https://github.com/duyet/monorepo";
  return `${repoUrl}/edit/master/apps/blog/_posts/${file}`;
};
