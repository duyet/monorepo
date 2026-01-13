import type { Post } from "@duyet/interfaces";
import { getPostBySlug } from "@duyet/libs/getPost";
import { markdownToHtml } from "@duyet/libs/markdownToHtml";
import { processMDXContentToHTML, hasMDXComponents } from "@duyet/libs/mdxUtils";
import { cn } from "@duyet/libs/utils";

import "katex/dist/contrib/mhchem.min.js";
import "katex/dist/katex.min.css";
import { OldPostWarning } from "./old-post-warning";
import { Snippet } from "./snippet";

interface ContentProps {
  post: Post & { isMDX?: boolean };
}

export default function Content({ post }: ContentProps) {
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
          "mb-10 mt-10 max-w-none",
          // Special styling for MDX content
          post.isMDX && "mdx-content"
        )}
        dangerouslySetInnerHTML={{ __html: post.content || "No content" }}
      />

      <Snippet html={post.snippet || ""} />
    </>
  );
}

export async function getPost(slug: string[]) {
  const slugStr = slug.join("/");
  const post = getPostBySlug(slugStr, [
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
  const isMDX = post.path?.endsWith(".mdx") || slugStr.endsWith(".mdx");

  // For MDX files, use the MDX processor which handles both regular markdown and MDX components
  // The result will be HTML that can be used with dangerouslySetInnerHTML
  // MDX components will be converted to HTML placeholders that can be hydrated client-side
  let content;
  if (isMDX) {
    // Use MDX processor for .mdx files
    content = await processMDXContentToHTML(markdownContent);
  } else {
    // Use standard markdown for .md files
    content = await markdownToHtml(markdownContent);
  }

  return {
    ...post,
    content,
    markdown_content: markdownContent,
    edit_url: getGithubEditUrl(post.slug),
    isMDX,
  };
}

const getGithubEditUrl = (slug: string) => {
  // Handle both .md and .mdx files
  const file = slug.replace(/\.(md|mdx|html|htm)$/, (ext) => {
    return ext === '.mdx' ? '.mdx' : '.md';
  }).replace(/^\/?/, "");
  const repoUrl =
    process.env.NEXT_PUBLIC_GITHUB_REPO_URL ||
    "https://github.com/duyet/monorepo";
  return `${repoUrl}/edit/master/apps/blog/_posts/${file}`;
};
