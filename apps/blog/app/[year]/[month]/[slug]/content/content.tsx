import type { Post } from "@duyet/interfaces";
import { getPostBySlug } from "@duyet/libs/getPost";
import { markdownToHtml } from "@duyet/libs/markdownToHtml";
import { cn } from "@duyet/libs/utils";
import dynamic from "next/dynamic";

import "katex/dist/contrib/mhchem.min.js";
import "katex/dist/katex.min.css";
import { OldPostWarning } from "./old-post-warning";
import { Snippet } from "./snippet";

// Dynamic import for MDX component to support client-side hydration
const MDXContent = dynamic(
  () => import("@duyet/components").then((mod) => mod.MDXContent),
  {
    ssr: false,
    loading: () => <div className="p-8 text-center">Loading MDX content...</div>,
  }
);

export default function Content({ post }: { post: Post }) {
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

      {post.is_mdx ? (
        <div className="mb-10 mt-10 max-w-none">
          <MDXContent post={post} />
        </div>
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
    "is_mdx",
  ]);

  const rawContent = post.content || "Error";

  // For MDX files, we pass the raw content to the client-side renderer
  // For MD files, we convert to HTML server-side
  let content = rawContent;
  if (!post.is_mdx) {
    content = await markdownToHtml(rawContent);
  }

  return {
    ...post,
    content,
    markdown_content: rawContent,
    edit_url: getGithubEditUrl(post.slug, post.extension),
  };
}

const getGithubEditUrl = (slug: string, extension?: "md" | "mdx") => {
  const ext = extension || "md";
  const file = slug.replace(/\.md|\.mdx|\.html|\.htm$/, `.${ext}`).replace(/^\/?/, "");
  const repoUrl =
    process.env.NEXT_PUBLIC_GITHUB_REPO_URL ||
    "https://github.com/duyet/monorepo";
  return `${repoUrl}/edit/master/apps/blog/_posts/${file}`;
};
