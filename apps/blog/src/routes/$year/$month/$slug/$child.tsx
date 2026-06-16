import type { Post, Series } from "@duyet/interfaces";
import { extractHeadings } from "@duyet/libs/extractHeadings";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { ReadingProgress } from "@/components/post/ReadingProgress";
import {
  type ChildNavItem,
  fetchAllPosts,
  getChildren,
  getRelatedPosts,
  getPostBySlug,
  getSeries,
} from "@/lib/posts";
import "@/styles/post-reader.css";
import { ChildBreadcrumb } from "../-breadcrumb";
import Content from "../-content";
import { PostFooter } from "../-post-footer";
import { PostHero } from "../-post-hero";
import { TableOfContents } from "../-toc";
import type { LoadedPost } from "../-types";

export const Route = createFileRoute("/$year/$month/$slug/$child")({
  head: ({ params, loaderData }) => {
    const { year, month, slug, child: rawChild } = params;
    const child = rawChild.replace(/\.(md|html)$/, "");
    const post = (loaderData as { post?: Post } | undefined)?.post;
    const title = post?.title || child.replace(/-/g, " ");
    const ogImage = post?.thumbnail
      ? new URL(post.thumbnail, "https://blog.duyet.net").toString()
      : undefined;
    return {
      meta: [
        { title: `${title} | Tôi là Duyệt` },
        { property: "og:type", content: "article" },
        {
          property: "og:url",
          content: `https://blog.duyet.net/${year}/${month}/${slug}/${child}`,
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
          href: `https://blog.duyet.net/${year}/${month}/${slug}/${child}.${post?.isMDX ? "mdx" : "md"}`,
        },
      ],
    };
  },
  loader: async ({ params }) => {
    const { year, month, slug: rawSlug, child: rawChild } = params;
    const slug = rawSlug.replace(/\.(md|html)$/, "");
    const child = rawChild.replace(/\.(md|html)$/, "");
    const slugPath = `${year}/${month}/${slug}/${child}`;

    let postWithContent;
    try {
      postWithContent = await getPostBySlug(slugPath);
    } catch {
      throw notFound();
    }

    if (!postWithContent.parent) {
      throw notFound();
    }

    const markdownContent = postWithContent.content || "";
    const headings = await extractHeadings(markdownContent);

    const repoUrl =
      import.meta.env.VITE_GITHUB_REPO_URL ||
      "https://github.com/duyet/monorepo";
    const sourceExt = postWithContent.isMDX ? "mdx" : "md";
    const file = `${year}/${month}/${slug}/${child}.${sourceExt}`;
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

    const related = await getRelatedPosts(postWithContent, 3);

    let parentTitle = "Overview";
    let series: Series | null = null;
    try {
      const posts = await fetchAllPosts();
      const parent = posts.find((p) => p.slug === postWithContent.parent);
      if (parent?.title) parentTitle = parent.title;
      if (parent?.series) {
        series = await getSeries({ name: parent.series as string });
      }
    } catch {
      // keep fallback
    }

    const siblings = postWithContent.parent
      ? await getChildren(postWithContent.parent)
      : [];

    function toNavItem(p: Post): ChildNavItem {
      const parts = p.slug.replace(/^\//, "").split("/");
      return {
        slug: p.slug,
        title: p.title,
        year: parts[0],
        month: parts[1],
        parent: parts.slice(2, -1).join("/"),
        child: parts[parts.length - 1],
      };
    }

    const post: LoadedPost = {
      ...postWithContent,
      content: htmlContent,
      mdxSource,
      headings,
      markdown_content: markdownContent,
      edit_url,
    };

    return { post, parentTitle, siblings: siblings.map(toNavItem), series, related };
  },
  component: ChildPostPage,
});

function ChildPostPage() {
  const { post, parentTitle, siblings, series, related } =
    Route.useLoaderData() as {
      post: LoadedPost;
      parentTitle: string;
      siblings: ChildNavItem[];
      series: Series | null;
      related: Post[];
    };

  return (
    <div className="post-reader overflow-x-hidden pb-0">
      <ReadingProgress />

      {/* Breadcrumb + sibling dropdown */}
      <ChildBreadcrumb
        parentTitle={parentTitle}
        parentSlug={post.parent ?? ""}
        currentTitle={post.title}
        siblings={siblings}
      />

      {/* Hero */}
      <PostHero post={post} />

      {/* Body + floating TOC */}
      <div className="mx-auto max-w-[1680px] px-4 sm:px-6 lg:px-8">
        <div className="post-body min-w-0">
          <Content post={post} />
        </div>
      </div>

      {/* Floating TOC — right side of viewport, outside content flow */}
      {post.headings && post.headings.length > 0 && (
        <TableOfContents headings={post.headings} />
      )}

      {/* Series tree + related */}
      <PostFooter post={post} series={series} related={related} />
    </div>
  );
}
