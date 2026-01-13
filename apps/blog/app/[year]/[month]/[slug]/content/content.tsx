import type { Post } from "@duyet/interfaces";
import { getPostBySlug } from "@duyet/libs/getPost";
import { markdownToHtml } from "@duyet/libs/markdownToHtml";
import { cn } from "@duyet/libs/utils";
import { MDXRemote } from "next-mdx-remote/rsc";

import "katex/dist/contrib/mhchem.min.js";
import "katex/dist/katex.min.css";
import { OldPostWarning } from "./old-post-warning";
import { Snippet } from "./snippet";

// Import MDX components
import { mdxComponents } from "@/lib/mdxProcessor";

interface PostWithMdx extends Post {
  isMdx?: boolean;
  markdown_content?: string;
}

export default function Content({ post }: { post: PostWithMdx }) {
  const isMdx = post.isMdx || false;

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

      {isMdx ? (
        <article
          className={cn(
            'prose-a[href^="https://"]:after:content-["↗︎"] prose dark:prose-invert prose-code:break-words',
            "mb-10 mt-10 max-w-none"
          )}
        >
          {/* @ts-ignore - RSC component */}
          <MDXRemote
            source={post.markdown_content || ""}
            components={mdxComponents}
          />
        </article>
      ) : (
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
    "isMdx",
  ]);

  // Check if this is an MDX file
  const isMdx = post.isMdx || false;
  const markdownContent = post.content || "Error";

  let content = "";

  if (isMdx) {
    // For MDX files, we use the MDXRemote component in the render
    // Just pass the raw content
    content = markdownContent;
  } else {
    // For MD files, use the existing markdown to HTML conversion
    content = await markdownToHtml(markdownContent);
  }

  return {
    ...post,
    content,
    markdown_content: markdownContent,
    edit_url: getGithubEditUrl(post.slug, isMdx),
  };
}

const getGithubEditUrl = (slug: string, isMdx: boolean = false) => {
  const extension = isMdx ? ".mdx" : ".md";
  const file = slug.replace(/\.md|\.mdx|\.html|\.htm$/, "").replace(/^\/?/, "");
  const repoUrl =
    process.env.NEXT_PUBLIC_GITHUB_REPO_URL ||
    "https://github.com/duyet/monorepo";
  return `${repoUrl}/edit/master/apps/blog/_posts/${file}${extension}`;
};
