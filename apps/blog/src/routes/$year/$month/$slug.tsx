import type { Post, Series } from "@duyet/interfaces";
import { formatReadingTime } from "@duyet/libs/date";
import type { TOCItem } from "@duyet/libs/extractHeadings";
import { extractHeadings } from "@duyet/libs/extractHeadings";
import { markdownToHtml } from "@duyet/libs/markdownToHtml";
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { Link2 } from "lucide-react";

function postParams(post: Post) {
  const [, year, month, slug] = post.slug.split("/");
  return { year, month, slug };
}
import { ReadingProgress } from "@/components/post/ReadingProgress";
import { getPostBySlug, getRelatedPosts, getSeries } from "@/lib/posts";
import { getSlug } from "@duyet/libs/getSlug";
import "@/styles/post-reader.css";
import Content from "./-content";
import { MarkdownMenuWrapper } from "./-markdown-menu-wrapper";
import Meta from "./-meta";

import { yearColor } from "@/lib/colors";

export const Route = createFileRoute("/$year/$month/$slug")({
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
      htmlContent = await markdownToHtml(markdownContent);
    }

    const series = postWithContent.series
      ? await getSeries({ name: postWithContent.series as string })
      : null;

    const related = await getRelatedPosts(postWithContent, 3);

    const post = {
      ...postWithContent,
      content: htmlContent,
      mdxSource,
      headings,
      markdown_content: markdownContent,
      edit_url,
    };

    return { post, series, related };
  },
  component: PostPage,
});

type LoadedPost = Post & {
  mdxSource?: string;
  headings?: TOCItem[];
  markdown_content?: string;
  edit_url?: string;
};

function PostHero({ post }: { post: LoadedPost }) {
  const date = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const readingTime = post.readingTime
    ? formatReadingTime(post.readingTime)
    : null;

  return (
    <header className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-12 md:pt-16 pb-6">
      <h1
        className="rd-display text-center text-[clamp(2.1rem,4.4vw,3.2rem)] leading-[1.04] tracking-[-0.04em] font-semibold mb-8"
      >
        {post.title}
      </h1>
      <div className="flex items-center justify-between mt-3 gap-2">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="rd-chip rd-mono text-[10.5px]">
            {post.category}
          </span>
          <span className="rd-mono rd-dim text-[12.5px]">
            {date}
          </span>
          {readingTime && (
            <span className="rd-mono rd-dim text-[12.5px]">
              · {readingTime}
            </span>
          )}
        </div>
        {post.markdown_content && (
          <MarkdownMenuWrapper
            markdownUrl={`${post.slug.replace(/\.html$/, "")}.md`}
            markdownContent={post.markdown_content}
            dropUp={false}
          />
        )}
      </div>

      {/* Hero image */}
      {post.thumbnail && (
        <img
          src={post.thumbnail}
          alt={post.title}
          loading="eager"
          className="block w-full my-[30px] rounded-[var(--rd-r)]"
        />
      )}
    </header>
  );
}

function ShareButton() {
  const handleShare = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
    } catch {
      // fallback: no-op in environments without clipboard
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
    >
      <Link2 className="h-4 w-4" />
      Share
    </button>
  );
}

function PostPage() {
  const { post, series, related } = Route.useLoaderData() as {
    post: LoadedPost;
    series: Series | null;
    related: Post[];
  };

  return (
    <div className="post-reader overflow-x-hidden pb-0">
      <ReadingProgress />

      {/* Hero */}
      <PostHero post={post} />

      {/* Body + TOC sidebar */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          <div className="post-body min-w-0 flex-1">
            <Content post={post} />
          </div>
          {post.headings && post.headings.length > 0 && (
            <aside className="hidden lg:block w-[200px] shrink-0">
              <div className="sticky top-20">
                <p className="rd-mono rd-dim text-[11px] uppercase tracking-[0.06em]">
                  On this page
                </p>
                <nav className="mt-3 flex flex-col gap-1.5">
                  {post.headings.map((h) => (
                    <a
                      key={h.id}
                      href={`#${h.id}`}
                      className={`block text-[13px] leading-snug no-underline text-[var(--rd-text-3)] hover:text-[var(--rd-text)] transition-colors ${
                        h.level === 3 ? "pl-3" : ""
                      }`}
                    >
                      {h.text}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Author + share */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-8 mt-16 border-t border-[var(--rd-border)]">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--rd-text-3)]">
            Duyet Le
          </p>
          <ShareButton />
        </div>
      </div>

      {/* Series + Related bento grid */}
      {(series || related.length > 0) && (
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mt-16 mb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-12">
            {/* Series */}
            {series && (
              <div>
                <p className="rd-mono rd-dim text-[11px] mb-4">
                  <Link
                    to="/series/$slug/"
                    params={{ slug: series.slug }}
                    className="hover:text-[var(--rd-text)] transition-colors no-underline text-inherit"
                  >
                    Part of the series
                  </Link>
                </p>
                <h3 className="font-[550] text-[clamp(14px,1.4vw,16px)] tracking-tight mb-3">
                  {series.name}
                </h3>
                <div className="rd-rows">
                  {series.posts.map((sPost, i) => {
                    const isCurrent = sPost.slug === post.slug;
                    return (
                      <Link
                        key={sPost.slug}
                        to="/$year/$month/$slug/"
                        params={postParams(sPost)}
                        className={`rd-row cursor-pointer no-underline text-inherit${isCurrent ? " bg-[var(--rd-surface-2)]" : ""}`}
                        style={{ gridTemplateColumns: "auto 1fr" }}
                      >
                        <span className="rd-mono rd-dim text-base leading-none tabular-nums w-[28px]">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="truncate">
                          <span className={`font-[550] text-[clamp(14px,1.4vw,16px)] tracking-tight${isCurrent ? " text-[var(--rd-accent)]" : ""}`}>
                            {sPost.title}
                          </span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Related */}
            {related.length > 0 && (
              <div>
                <p className="rd-mono rd-dim text-[11px] mb-4">Related</p>
                <div className="rd-rows">
                  {related.map((relPost) => {
                    const [, year, month, slug] = relPost.slug.split("/");
                    const yr = new Date(relPost.date).getFullYear();
                    return (
                      <Link
                        key={relPost.slug}
                        to="/$year/$month/$slug/"
                        params={{ year, month, slug }}
                        className="rd-row cursor-pointer no-underline text-inherit"
                        style={{ gridTemplateColumns: "auto 1fr auto" }}
                      >
                        <span
                          className="rd-mono text-base font-bold leading-none shrink-0"
                          style={{ color: yearColor(yr) }}
                        >
                          {yr}
                        </span>
                        <span className="truncate">
                          <span className="font-[550] text-[clamp(14px,1.4vw,16px)] tracking-tight">
                            {relPost.title}
                          </span>
                        </span>
                        <span className="rd-tag-pill text-[10.5px] !py-[1px] !px-1.5 shrink-0 ml-2">
                          {relPost.category}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
