import type { Post, Series } from "@duyet/interfaces";
import { formatReadingTime } from "@duyet/libs/date";
import type { TOCItem } from "@duyet/libs/extractHeadings";
import { extractHeadings } from "@duyet/libs/extractHeadings";
import { markdownToHtml } from "@duyet/libs/markdownToHtml";
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { ArrowLeft, Link2 } from "lucide-react";
import { SeriesBox } from "@/components/layout/SeriesBox";
import { ReadingProgress } from "@/components/post/ReadingProgress";
import { getPostBySlug, getRelatedPosts, getSeries } from "@/lib/posts";
import { getSlug } from "@duyet/libs/getSlug";
import "@/styles/post-reader.css";
import Content from "./-content";
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
      <Link
        to="/"
        className="rd-btn-text"
        style={{
          cursor: "pointer",
          paddingLeft: 0,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          color: "var(--rd-text-3)",
          textDecoration: "none",
        }}
      >
        <ArrowLeft size={14} /> All posts
      </Link>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 18, flexWrap: "wrap" }}>
        <span className="rd-chip rd-mono" style={{ fontSize: 10.5 }}>
          {post.category}
        </span>
        <span className="rd-mono rd-dim" style={{ fontSize: 12.5 }}>
          {date} {readingTime && `· ${readingTime}`}
        </span>
      </div>
      <h1
        className="rd-display"
        style={{
          fontSize: "clamp(2.1rem, 4.4vw, 3.2rem)",
          marginTop: 18,
          lineHeight: 1.04,
          letterSpacing: "-0.04em",
          fontWeight: 600,
        }}
      >
        {post.title}
      </h1>

      {/* Hero image */}
      {post.thumbnail && (
        <img
          src={post.thumbnail}
          alt={post.title}
          loading="eager"
          style={{
            display: "block",
            width: "100%",
            marginBottom: 30,
            marginTop: 30,
            borderRadius: "var(--rd-r)",
          }}
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
            <div style={{ marginTop: 34 }}>
              <div className="rd-eyebrow" style={{ fontSize: 10, marginBottom: 14 }}>
                Tagged
              </div>
              <div className="rd-tag-cloud">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    to="/tag/$tag/"
                    params={{ tag: getSlug(tag) }}
                    className="rd-tag-pill"
                    style={{ fontSize: 13, textDecoration: "none" }}
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
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-8 mt-16" style={{ borderTop: "1px solid var(--rd-border)" }}>
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: "var(--rd-text-3)" }}>
            Duyet Le
          </p>
          <ShareButton />
        </div>
      </div>

      {/* Related articles */}
      {related.length > 0 && (
        <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 mt-16 mb-24">
          <p className="rd-mono rd-dim" style={{ fontSize: 11, marginBottom: 16 }}>
            Related
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            {related.map((relPost) => {
              const [, year, month, slug] = relPost.slug.split("/");
              return (
                <li key={relPost.slug}>
                  <Link
                    to="/$year/$month/$slug/"
                    params={{ year, month, slug }}
                    style={{
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "baseline",
                      gap: 10,
                      color: "var(--rd-text)",
                      fontSize: 15,
                    }}
                  >
                    <span className="rd-mono rd-dim" style={{ fontSize: 12, whiteSpace: "nowrap" }}>
                      {new Date(relPost.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                    <span style={{ fontWeight: 500 }}>
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
