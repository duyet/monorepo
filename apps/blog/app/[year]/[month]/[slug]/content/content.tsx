import type { Post } from "@duyet/interfaces";
import { getPostBySlug } from "@duyet/libs/getPost";
import { markdownToHtml } from "@duyet/libs/markdownToHtml";
import { cn } from "@duyet/libs/utils";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

import "katex/dist/contrib/mhchem.min.js";
import "katex/dist/katex.min.css";
import { OldPostWarning } from "./old-post-warning";
import { Snippet } from "./snippet";
import { useMDXComponents } from "../../../../../mdx-components";

interface ExtendedPost extends Post {
  isMdx?: boolean;
  mdxContent?: React.ReactNode;
}

export default function Content({ post }: { post: ExtendedPost }) {
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

      {isMdx && post.mdxContent ? (
        // Render MDX content as React components
        <article
          className={cn(
            'prose-a[href^="https://"]:after:content-["↗︎"] prose dark:prose-invert prose-code:break-words',
            "mb-10 mt-10 max-w-none"
          )}
        >
          {post.mdxContent}
        </article>
      ) : (
        // Render standard markdown content as HTML
        <article
          className={cn(
            'prose-a[href^="https://"]:after:content-["↗︎"] prose dark:prose-invert prose-code:break-words',
            "mb-10 mt-10 max-w-none"
          )}
          dangerouslySetInnerHTML={{ __html: post.content || "No content" }}
        />
      )}

      {!isMdx && <Snippet html={post.snippet || ""} />}
    </>
  );
}

export async function getPost(slug: string[]) {
  const join = () => require("node:path").join;
  const nodeFs = () => require("node:fs");

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

  // Check if this is an MDX file
  const fs = nodeFs();
  const joinFn = join();
  const postsDir = joinFn(process.cwd(), "_posts");
  const mdxPath = joinFn(postsDir, `${slugStr}.mdx`);
  const isMdx = fs.existsSync(mdxPath);

  let result: any = {
    ...post,
    isMdx,
    markdown_content: post.content || "",
    edit_url: getGithubEditUrl(post.slug),
  };

  if (isMdx) {
    // Compile MDX content
    const fs = require("node:fs");
    const mdxContent = fs.readFileSync(mdxPath, "utf8");

    try {
      const { content } = await compileMDX({
        source: mdxContent,
        options: {
          parseFrontmatter: true,
          mdxOptions: {
            remarkPlugins: [remarkGfm, remarkMath],
            rehypePlugins: [rehypeKatex, rehypeSlug, rehypeAutolinkHeadings],
          },
        },
        components: useMDXComponents({}),
      });

      result.mdxContent = content;
    } catch (error) {
      console.error("Error compiling MDX:", error);
      result.mdxContent = <div>Error compiling MDX content</div>;
    }
  } else {
    // Standard markdown processing
    const markdownContent = post.content || "Error";
    const content = await markdownToHtml(markdownContent);
    result.content = content;
  }

  return result;
}

const getGithubEditUrl = (slug: string) => {
  const file = slug.replace(/\.md|\.mdx|\.html|\.htm$/, ".md").replace(/^\/?/, "");
  const repoUrl =
    process.env.NEXT_PUBLIC_GITHUB_REPO_URL ||
    "https://github.com/duyet/monorepo";
  return `${repoUrl}/edit/master/apps/blog/_posts/${file}`;
};
