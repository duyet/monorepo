import type { Post, Series } from "@duyet/interfaces";
import { extractHeadings } from "@duyet/libs/extractHeadings";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { ReadingProgress } from "@/components/post/ReadingProgress";
import { buildArticleHead } from "@/lib/head";
import { ogAbsolute, ogCardPath } from "@/lib/og";
import {
  getChildren,
  getPostBySlug,
  getRelatedPosts,
  getSeries,
} from "@/lib/posts";
import { resolveArticleHtml } from "@/lib/resolve-article-html";
import { TWITTER_WIDGETS_SRC } from "@/lib/x-embed";
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
    const canonical = `https://blog.duyet.net/${year}/${month}/${slug}`;
    // The dither card for this post, written by scripts/generate-og.ts. Always
    // present, so every post gets a card even when it has no thumbnail (71 of
    // 319 posts have none) — those render as the type-only fallback.
    const ogImage = ogAbsolute(ogCardPath(`/${year}/${month}/${slug}`));
    return buildArticleHead({
      title,
      description: post?.excerpt ?? "",
      url: canonical,
      image: ogImage,
      markdownHref: `${canonical}.md`,
      datePublished: post?.date,
      // X embeds inside the post body become live iframes only once
      // widgets.js runs, so it loads on post pages (which can embed) but not
      // on the lighter child/note surfaces.
      scripts: [{ src: TWITTER_WIDGETS_SRC, async: true }],
    });
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
    const edit_url = `${repoUrl}/edit/main/apps/blog/_posts/${file}`;

    const { htmlContent, mdxSource } =
      await resolveArticleHtml(postWithContent);

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
  const data = Route.useLoaderData() as
    | {
        post: LoadedPost;
        series: Series | null;
        related: Post[];
        children: Post[];
      }
    | undefined;
  if (!data?.post) {
    throw notFound();
  }
  const { post, series, related, children } = data;

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
