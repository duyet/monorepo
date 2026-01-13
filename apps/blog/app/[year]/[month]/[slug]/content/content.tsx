import type { Post } from "@duyet/interfaces";
import { getPostBySlug } from "@duyet/libs/getPost";
import { markdownToHtml } from "@duyet/libs/markdownToHtml";
import { cn } from "@duyet/libs/utils";

import "katex/dist/contrib/mhchem.min.js";
import "katex/dist/katex.min.css";
import { OldPostWarning } from "./old-post-warning";
import { Snippet } from "./snippet";
import { processPostWithMDX, MDXRemote, mdxComponents } from "@/lib/mdx";

interface MDXPost extends Post {
  isMDX?: boolean;
  mdxContent?: any;
}

export default function Content({ post }: { post: MDXPost }) {
  const isMDX = post.isMDX === true;

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
        // MDX content rendered with components
        <article
          className={cn(
            'prose-a[href^="https://"]:after:content-["↗︎"] prose dark:prose-invert prose-code:break-words',
            "mb-10 mt-10 max-w-none"
          )}
        >
          <MDXRemote
            {...post.mdxContent!}
            components={mdxComponents}
          />
        </article>
      ) : (
        // Regular markdown rendered as HTML
        <article
          className={cn(
            'prose-a[href^="https://"]:after:content-["↗︎"] prose dark:prose-invert prose-code:break-words',
            "mb-10 mt-10 max-w-none"
          )}
          dangerouslySetInnerHTML={{ __html: post.content || "No content" }}
        />
      )}

      {!isMDX && <Snippet html={post.snippet || ""} />}
    </>
  );
}

export async function getPost(slug: string[]) {
  // Use MDX-aware processing
  const post = await processPostWithMDX(slug);

  // For MDX posts, we don't need HTML conversion
  if (post.isMDX) {
    return {
      ...post,
      markdown_content: "", // MDX content is in mdxContent
      edit_url: getGithubEditUrl(post.slug, true),
    };
  }

  // Regular markdown processing
  const markdownContent = post.content || "Error";
  const content = await markdownToHtml(markdownContent);

  return {
    ...post,
    content,
    markdown_content: markdownContent,
    edit_url: getGithubEditUrl(post.slug, false),
  };
}

const getGithubEditUrl = (slug: string, isMDX: boolean = false) => {
  const extension = isMDX ? ".mdx" : ".md";
  const file = slug.replace(/\.(md|mdx|html|htm)$/, "").replace(/^\/?/, "");
  const repoUrl =
    process.env.NEXT_PUBLIC_GITHUB_REPO_URL ||
    "https://github.com/duyet/monorepo";
  return `${repoUrl}/edit/master/apps/blog/_posts/${file}${extension}`;
};
