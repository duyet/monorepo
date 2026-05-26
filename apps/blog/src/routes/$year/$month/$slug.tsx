import type { Post, Series } from "@duyet/interfaces";
import type { TOCItem } from "@duyet/libs/extractHeadings";
import { extractHeadings } from "@duyet/libs/extractHeadings";
import { formatReadingTime } from "@duyet/libs/date";
import { markdownToHtml } from "@duyet/libs/markdownToHtml";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowRight, Calendar, ChevronRight, Clock, Link2 } from "lucide-react";
import { SeriesBox } from "@/components/layout/SeriesBox";
import { ReadingProgress } from "@/components/post/ReadingProgress";
import { TableOfContents } from "@/components/post/TableOfContents";
import { getPostBySlug, getRelatedPosts, getSeries } from "@/lib/posts";
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
  const categorySlug =
    (post as Post & { category_slug?: string }).category_slug ||
    post.category?.toLowerCase().replace(/\s+/g, "-");

  return (
    <header className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 pt-12 md:pt-16 pb-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <a href="/" className="hover:text-foreground transition-colors">
          Blog
        </a>
        <ChevronRight className="h-3.5 w-3.5" />
        <a
          href={`/category/${categorySlug}/`}
          className="hover:text-foreground transition-colors"
        >
          {post.category}
        </a>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground truncate">{post.title}</span>
      </nav>

      {/* Title */}
      <h1 className="mt-8 text-3xl md:text-4xl font-bold tracking-tight">
        {post.title}
      </h1>

      {/* Description */}
      {post.excerpt && (
        <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed max-w-3xl">
          {post.excerpt}
        </p>
      )}

      {/* Author + date + reading time row */}
      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <span>Duyet Le</span>
        <span aria-hidden>·</span>
        <span className="inline-flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          {date}
        </span>
        {readingTime && (
          <>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {readingTime}
            </span>
          </>
        )}
      </div>

      {/* Thumbnail */}
      {post.thumbnail && (
        <div className="mt-10 aspect-[21/9] w-full overflow-hidden rounded-lg bg-muted">
          <img
            src={post.thumbnail}
            alt={post.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
    </header>
  );
}

function RelatedPostCard({ post }: { post: Post }) {
  const [, year, month, slug] = post.slug.split("/");
  const href = `/${year}/${month}/${slug}/`;
  const readingTime = post.readingTime
    ? formatReadingTime(post.readingTime)
    : null;
  const metaParts = ["ARTICLE", readingTime].filter(Boolean).join(" · ");

  return (
    <a href={href} className="block group">
      {post.thumbnail && (
        <div className="aspect-video overflow-hidden rounded-md bg-muted mb-4">
          <img
            src={post.thumbnail}
            alt={post.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}
      <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
        {metaParts}
      </p>
      <h3 className="mt-2 text-base font-semibold tracking-tight line-clamp-2">
        {post.title}
      </h3>
      {post.excerpt && (
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {post.excerpt}
        </p>
      )}
    </a>
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

      {/* Body: 2-col grid */}
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,760px)_240px] lg:gap-12 lg:justify-center">
          <div className="post-body min-w-0">
            <Content post={post} />

            <Meta post={post} series={series} className="post-meta mt-12" />

            {series && <SeriesBox series={series} current={post.slug} />}
          </div>

          <aside className="hidden lg:block sticky top-20 self-start">
            <TableOfContents headings={post.headings || []} />
          </aside>
        </div>
      </div>

      {/* Author bio strip */}
      <div className="border-t pt-8 mt-16">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src="https://github.com/duyet.png"
              alt="Duyet Le"
              className="h-12 w-12 rounded-full border bg-muted"
            />
            <div>
              <p className="text-sm font-medium">Duyet Le</p>
              <p className="text-xs text-muted-foreground">
                Founder @ duyet.net
              </p>
            </div>
          </div>
          <ShareButton />
        </div>
      </div>

      {/* Related articles */}
      {related.length > 0 && (
        <section className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 mt-20 mb-24">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                CONTINUE READING
              </p>
              <h2 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight">
                Related articles
              </h2>
            </div>
            <a
              href="/"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              View all articles <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((relPost) => (
              <RelatedPostCard key={relPost.slug} post={relPost} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
