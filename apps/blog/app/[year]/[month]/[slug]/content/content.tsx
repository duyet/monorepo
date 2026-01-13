import type { Post } from "@duyet/interfaces";
import { getPostBySlug } from "@duyet/libs/getPost";
import { markdownToHtml, mdxToHtml } from "@duyet/libs/markdownToHtml";
import { cn } from "@duyet/libs/utils";

import "katex/dist/contrib/mhchem.min.js";
import "katex/dist/katex.min.css";
import { OldPostWarning } from "./old-post-warning";
import { Snippet } from "./snippet";

// Dynamic import for MDX content (client-side only)
import dynamic from "next/dynamic";

const MDXContentClient = dynamic(
  () => import("../../../components/mdx/MDXContent").then((mod) => mod.MDXContent),
  { ssr: false, loading: () => <div>Loading MDX content...</div> }
);

export default function Content({ post }: { post: Post }) {
  const isMDX = post.extension === "mdx";

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
        {isMDX ? (
          <MDXContentClient content={post.markdown_content || post.content || ""} />
        ) : (
          <div dangerouslySetInnerHTML={{ __html: post.content || "No content" }} />
        )}
      </article>

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

  const markdownContent = post.content || "Error";
  const extension = post.extension || "md";

  // Process content based on extension
  let content = "";
  if (extension === "mdx") {
    // For MDX, we store the raw content and let the client-side MDX renderer handle it
    // We also process it to HTML for SEO/preview
    content = await mdxToHtml(markdownContent);
  } else {
    content = await markdownToHtml(markdownContent);
  }

  return {
    ...post,
    content,
    markdown_content: markdownContent,
    edit_url: getGithubEditUrl(post.slug, extension),
  };
}

const getGithubEditUrl = (slug: string, extension: string = "md") => {
  const file = slug.replace(/\.md|\.mdx|\.html|\.htm$/, `.${extension}`).replace(/^\/?/, "");
  const repoUrl =
    process.env.NEXT_PUBLIC_GITHUB_REPO_URL ||
    "https://github.com/duyet/monorepo";
  return `${repoUrl}/edit/master/apps/blog/_posts/${file}`;
};
