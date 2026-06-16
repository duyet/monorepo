import type { Post, Series } from "@duyet/interfaces";
import { extractHeadings } from "@duyet/libs/extractHeadings";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { ReadingProgress } from "@/components/post/ReadingProgress";
import {
  getChildren,
  getPostBySlug,
  getRelatedPosts,
  getSeries,
} from "@/lib/posts";
import "@/styles/post-reader.css";
import { Chapters } from "../-chapters";
import Content from "../-content";
import { PostFooter } from "../-post-footer";
import { PostHero } from "../-post-hero";
import { TableOfContents } from "../-toc";
import type { LoadedPost } from "../-types";

export const Route = createFileRoute("/$year/$month/$slug/")({
  head: ({ params, loaderData }) => {
    const { year, month, slug: rawSlug } = params;
    const slug = rawSlug.replace(/\.(md|html)$/, "");
    const post = (loaderData as { post?: Post } | undefined)?.post;
    const title = post?.title || slug.replace(/-/g, " ");
    const ogImage = post?.thumbnail
      ? new URL(post.thumbnail, "https://blog.duyet.net").toString()
      : undefined;
    return {
      meta: [
        { title: `${title} | Tôi là Duyệt` },
        { property: "og:type", content: "article" },
        {
          property: "og:url",
          content: `https://blog.duyet.net/${year}/${month}/${slug}`,
        },
        ...(post?.title ? [{ property: "og:title", content: post.title }] : []),
        ...(post?.excerpt
          ? [
              { name: "description", content: post.excerpt },
              { property: "og:description", content: post.excerpt },
            ]
          : []),
        ...(ogImage ? [{ property: "og:image", content: ogImage }] : []),
      ],
      links: [
        {
          rel: "alternate",
          type: "text/markdown",
          href: `https://blog.duyet.net/${year}/${month}/${slug}.md`,
        },
      ],
    };
  },
  loader: async ({ params }) => {
    const { year, month, slug: rawSlug } = params;
    const slug = rawSlug.replace(/\.(md|html)$/, "");
    const slugPath = `${year}/${month}/${slug}`;

    let postWithContent;
    try {
      postWithContent = await getPostBySlug(slugPath);
    } catch {
      throw notFound();
    }

    const markdownContent = postWithContent.content || "";
    const headings = await extractHeadings(markdownContent);

    const repoUrl =
      import.meta.env.VITE_GITHUB_REPO_URL ||
      "https://github.com/duyet/monorepo";
    const file = `${year}/${month}/${slug}.md`;
    const edit_url = `${repoUrl}/edit/master/apps/blog/_posts/${file}`;

    let htmlContent = "";
    let mdxSource: string | undefined;

    if (postWithContent.isMDX) {
      mdxSource = markdownContent;
    } else if (postWithContent.html) {
      htmlContent = postWithContent.html;
    } else {
      if (typeof window === "undefined") {
        const { markdownToHtml } = await import("@duyet/libs/markdownToHtml");
        htmlContent = await markdownToHtml(markdownContent);
      } else {
        console.error("markdownToHtml called on client for post:", slugPath);
      }
    }

    const series = postWithContent.series
      ? await getSeries({ name: postWithContent.series as string })
      : null;

    const related = await getRelatedPosts(postWithContent, 3);

    // Chaptered posts: load children for the Chapters list. Cheap — filters
    // an in-memory array and is empty for non-parent posts.
    const children = await getChildren(postWithContent.slug);

    const post = {
      ...postWithContent,
      content: htmlContent,
      mdxSource,
      headings,
      markdown_content: markdownContent,
      edit_url,
    };

    return { post, series, related, children };
  },
  component: PostPage,
});

function PostPage() {
  const { post, series, related, children } = Route.useLoaderData() as {
    post: LoadedPost;
    series: Series | null;
    related: Post[];
    children: Post[];
  };

  const hasChildren = children.length > 0;

  return (
    <div className="post-reader overflow-x-hidden pb-0">
      <ReadingProgress />

      {/* Hero */}
      <PostHero post={post} />

      {/* Body + floating TOC */}
      <div className="mx-auto max-w-[1680px] px-4 sm:px-6 lg:px-8">
        <div className="post-body min-w-0">
          <Content post={post} />
        </div>
      </div>

      {/* Chapters list (parent posts with `parts:`) */}
      {hasChildren && <Chapters chapters={children} parentSlug={post.slug} />}

      {/* Floating TOC — right side of viewport, outside content flow.
          Suppressed for chaptered parents (the Chapters list serves as nav). */}
      {!hasChildren && post.headings && post.headings.length > 0 && (
        <TableOfContents headings={post.headings} />
      )}

      {/* Series + Related + Changelog bento grid */}
      <PostFooter post={post} series={series} related={related} />
    </div>
  );
}
