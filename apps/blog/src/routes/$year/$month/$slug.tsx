import type { Post, Series } from "@duyet/interfaces";
import { formatReadingTime } from "@duyet/libs/date";
import type { TOCItem } from "@duyet/libs/extractHeadings";
import { extractHeadings } from "@duyet/libs/extractHeadings";
import { markdownToHtml } from "@duyet/libs/markdownToHtml";
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { Link2 } from "lucide-react";
import { SeriesBox } from "@/components/layout/SeriesBox";
import { ReadingProgress } from "@/components/post/ReadingProgress";
import { getPostBySlug, getRelatedPosts, getSeries } from "@/lib/posts";
import { getSlug } from "@duyet/libs/getSlug";
import "@/styles/post-reader.css";
import Content from "./-content";
import { MarkdownMenuWrapper } from "./-markdown-menu-wrapper";
import Meta from "./-meta";

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
        className="rd-display text-center text-[clamp(2.1rem,4.4vw,3.2rem)] leading-[1.04] tracking-[-0.04em] font-semibold"
      >
        {post.title}
      </h1>
      <div className="flex gap-2.5 items-center justify-center mt-3 flex-wrap">
        <span className="rd-chip rd-mono text-[10.5px]">
          {post.category}
        </span>
        <span className="rd-mono rd-dim text-[12.5px]">
          {date} {readingTime && `· ${readingTime}`}
        </span>
        {post.markdown_content && (
          <div>
            <MarkdownMenuWrapper
              markdownUrl={`${post.slug.replace(/\.html$/, "")}.md`}
              markdownContent={post.markdown_content}
              dropUp={false}
            />
          </div>
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

      {/* Body — text stays at narrow measure (~68ch); images & tables break out to a wider track */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="post-body min-w-0">
          <Content post={post} />

          <Meta post={post} series={series} className="post-meta mt-12" />

          {/* Tags cloud */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-[34px]">
              <div className="rd-eyebrow text-[10px] mb-[14px]">
                Tagged
              </div>
              <div className="rd-tag-cloud">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    to="/tag/$tag/"
                    params={{ tag: getSlug(tag) }}
                    className="rd-tag-pill text-[13px] no-underline"
                  >
                    <span className="rd-hash">#</span>{tag.toLowerCase()}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {series && <SeriesBox series={series} current={post.slug} />}
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

      {/* Related articles */}
      {related.length > 0 && (
        <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 mt-16 mb-24">
          <p className="rd-mono rd-dim text-[11px] mb-4">
            Related
          </p>
          <ul className="list-none p-0 m-0 flex flex-col gap-3">
            {related.map((relPost) => {
              const [, year, month, slug] = relPost.slug.split("/");
              return (
                <li key={relPost.slug}>
                  <Link
                    to="/$year/$month/$slug/"
                    params={{ year, month, slug }}
                    className="no-underline flex items-baseline gap-2.5 text-[var(--rd-text)] text-[15px]"
                  >
                    <span className="rd-mono rd-dim text-xs whitespace-nowrap">
                      {new Date(relPost.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                    <span className="font-medium">
                      {relPost.title}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
