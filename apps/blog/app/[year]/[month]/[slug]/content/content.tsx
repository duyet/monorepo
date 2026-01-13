import type { Post } from "@duyet/interfaces";
import { getPostBySlug, getPostByPath } from "@duyet/libs/getPost";
import { markdownToHtml } from "@duyet/libs/markdownToHtml";
import { cn } from "@duyet/libs/utils";
import { serialize } from "next-mdx-remote/serialize";
import { MDXRemote } from "next-mdx-remote/rsc";

import "katex/dist/contrib/mhchem.min.js";
import "katex/dist/katex.min.css";
import { OldPostWarning } from "./old-post-warning";
import { Snippet } from "./snippet";

// Import all MDX components
import {
  ToolComparison,
  FeatureMatrix,
  WakaTimeChart,
  ToolTimeline,
  WorkflowDiagram,
  VersionDiff,
  ToolList
} from "@/components/mdx/index";

const mdxComponents = {
  ToolComparison,
  FeatureMatrix,
  WakaTimeChart,
  ToolTimeline,
  WorkflowDiagram,
  VersionDiff,
  ToolList,
};

interface ContentProps {
  post: Post & { isMdx?: boolean; mdxSource?: any };
}

export default async function Content({ post }: ContentProps) {
  // Handle MDX content
  if (post.isMdx && post.mdxSource) {
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
          <MDXRemote {...post.mdxSource} components={mdxComponents} />
        </article>

        {post.snippet && <Snippet html={post.snippet} />}
      </>
    );
  }

  // Handle regular markdown
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

      {post.snippet && <Snippet html={post.snippet} />}
    </>
  );
}

export async function getPost(slug: string[]) {
  const slugPath = slug.join("/");

  // Try to detect if it's an MDX file first
  const nodeJoin = () => require("node:path").join;
  const nodeFs = () => require("node:fs");
  const postsDir = nodeJoin()(process.cwd(), "_posts");

  // Try .mdx first, then .md
  let fullPath = nodeJoin()(postsDir, `${slugPath}.mdx`);
  let isMdx = true;

  if (!nodeFs().existsSync(fullPath)) {
    fullPath = nodeJoin()(postsDir, `${slugPath}.md`);
    isMdx = false;
  }

  const post = getPostByPath(fullPath, [
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
  ]);

  // Update slug to ensure proper format
  post.slug = `/${slugPath}`;

  if (isMdx) {
    // For MDX, serialize the content
    const mdxSource = await serialize(post.content || "", {
      parseFrontmatter: false,
    });

    return {
      ...post,
      isMdx: true,
      mdxSource,
      edit_url: getGithubEditUrl(post.slug, true),
    };
  } else {
    // For regular markdown, process with unified
    const markdownContent = post.content || "Error";
    const content = await markdownToHtml(markdownContent);

    return {
      ...post,
      content,
      markdown_content: markdownContent,
      edit_url: getGithubEditUrl(post.slug, false),
    };
  }
}

const getGithubEditUrl = (slug: string, isMdx: boolean = false) => {
  const extension = isMdx ? ".mdx" : ".md";
  const file = slug.replace(/\.md|\.mdx|\.html|\.htm$/, extension).replace(/^\/?/, "");
  const repoUrl =
    process.env.NEXT_PUBLIC_GITHUB_REPO_URL ||
    "https://github.com/duyet/monorepo";
  return `${repoUrl}/edit/master/apps/blog/_posts/${file}`;
};
