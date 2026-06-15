import type { Post } from "@duyet/interfaces";
import { extractHeadings } from "@duyet/libs/extractHeadings";
import { markdownToHtml } from "@duyet/libs/markdownToHtml";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { ReadingProgress } from "@/components/post/ReadingProgress";
import {
  type ChildNavItem,
  getChildNavigation,
  getPostBySlug,
  getRelatedPosts,
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
          href: `https://blog.duyet.net/${year}/${month}/${slug}/${child}.md`,
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

    const markdownContent = postWithContent.content || "";
    const headings = await extractHeadings(markdownContent);

    const repoUrl =
      import.meta.env.VITE_GITHUB_REPO_URL ||
      "https://github.com/duyet/monorepo";
    const file = `${year}/${month}/${slug}/${child}.md`;
    const edit_url = `${repoUrl}/edit/master/apps/blog/_posts/${file}`;

    let htmlContent = "";
    let mdxSource: string | undefined;

    if (postWithContent.isMDX) {
      mdxSource = markdownContent;
    } else if (postWithContent.html) {
      htmlContent = postWithContent.html;
    } else {
      htmlContent = await markdownToHtml(markdownContent);
    }

    const { prev, next } = await getChildNavigation(postWithContent.slug);
    const related = await getRelatedPosts(postWithContent, 3);

    // Parent title for the breadcrumb. Fall back gracefully if the parent
    // post isn't in the index for some reason.
    let parentTitle = "Overview";
    if (postWithContent.parent) {
      try {
        const parent = await getPostBySlug(postWithContent.parent);
        if (parent.title) parentTitle = parent.title;
      } catch {
        // keep fallback
      }
    }

    const post: LoadedPost = {
      ...postWithContent,
      content: htmlContent,
      mdxSource,
      headings,
      markdown_content: markdownContent,
      edit_url,
    };

    return { post, parentTitle, prev, next, related };
  },
  component: ChildPostPage,
});

function ChildPostPage() {
  const { post, parentTitle, prev, next, related } = Route.useLoaderData() as {
    post: LoadedPost;
    parentTitle: string;
    prev: ChildNavItem | null;
    next: ChildNavItem | null;
    related: Post[];
  };

  return (
    <div className="post-reader overflow-x-hidden pb-0">
      <ReadingProgress />

      {/* Breadcrumb + sibling nav */}
      <ChildBreadcrumb
        parentTitle={parentTitle}
        parentSlug={post.parent ?? ""}
        currentTitle={post.title}
        prev={prev}
        next={next}
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

      {/* Related (no series nav for children — siblings live in the breadcrumb) */}
      <PostFooter post={post} series={null} related={related} />
    </div>
  );
}
