import type { Post, TagCount } from "@duyet/interfaces";
import { dateFormat } from "@duyet/libs/date";
import { getSlug } from "@duyet/libs/getSlug";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import type { CSSProperties, ReactElement } from "react";
import { getAllTags, getPostsByTag } from "@/lib/posts";

function findTagBySlug(tags: TagCount, slug: string): string | undefined {
  return (
    Object.keys(tags).find((t) => getSlug(t) === slug) ||
    Object.keys(tags).find((t) => getSlug(t).endsWith(`-${slug}`))
  );
}

function slugToDisplay(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export const Route = createFileRoute("/tag/$tag")({
  head: ({ params }) => {
    const display = slugToDisplay(params.tag);
    return {
      meta: [
        { title: `${display} | Tôi là Duyệt` },
        { name: "description", content: `Blog posts tagged with ${display}.` },
      ],
    };
  },
  loader: async ({ params }) => {
    const [all, tags] = await Promise.all([
      getPostsByTag(params.tag),
      getAllTags(),
    ]);
    if (!findTagBySlug(tags, params.tag)) throw notFound();
    // Children are nested under their parent; keep flat tag views to top-level.
    return { posts: all.filter((p) => !p.parent), tags };
  },
  component: PostsByTag,
});

function postParams(post: Post) {
  const [, year, month, slug] = post.slug.split("/");
  return { year, month, slug };
}

function PostsByTag(): ReactElement {
  const { tag } = Route.useParams();
  const { posts } = Route.useLoaderData() as {
    posts: Post[];
    tags: TagCount;
  };

  const displayName = slugToDisplay(tag);

  const postsByYear = posts.reduce((acc: Record<number, Post[]>, post) => {
    const year = new Date(post.date).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(post);
    return acc;
  }, {});

  return (
    <div className="px-6 md:px-8">
      <header className="pt-24 md:pt-28 pb-10 mx-auto">
        <span className="inline-block text-[0.6875rem] font-medium tracking-[0.16em] uppercase text-muted-foreground mb-3.5">
          <Link
            to="/tags/"
            className="transition-colors hover:text-[color:var(--em-foreground)]"
          >
            Tag
          </Link>
        </span>
        <h1 className="text-[clamp(2.25rem,4.5vw,3.25rem)] font-semibold leading-[1.08] tracking-[-0.018em] text-foreground m-0">
          {displayName}
        </h1>
        <div className="mt-5 flex flex-wrap items-center gap-y-2 gap-x-3 text-[0.8125rem] text-muted-foreground tabular-nums [&>*+*]:before:content-['·'] [&>*+*]:before:mr-3 [&>*+*]:before:text-muted-foreground">
          <span>
            {posts.length} {posts.length === 1 ? "post" : "posts"}
          </span>
          <span>
            {Object.keys(postsByYear).length}{" "}
            {Object.keys(postsByYear).length === 1 ? "year" : "years"}
          </span>
        </div>
      </header>

      {Object.entries(postsByYear)
        .sort(([a], [b]) => Number.parseInt(b, 10) - Number.parseInt(a, 10))
        .map(([year, yearPosts]) => (
          <div key={year}>
            <h2 className="max-w-2xl mx-auto mt-12 pb-2 text-lg font-medium text-muted-foreground tabular-nums tracking-[0.04em]">
              {year}
            </h2>
            <section
              className="max-w-2xl mx-auto pt-6"
              aria-label={`Posts from ${year}`}
            >
              {yearPosts.map((post, i) => {
                const style: CSSProperties = {
                  animationDelay: `${Math.min(i, 8) * 40}ms`,
                };
                return (
                  <Link
                    key={post.slug}
                    to="/$year/$month/$slug/"
                    params={postParams(post)}
                    className="block px-4 py-5 mb-3 bg-card border border-border rounded-[var(--radius)] no-underline text-inherit transition-colors hover:border-foreground hover:bg-muted focus-visible:outline-none focus-visible:border-foreground focus-visible:bg-muted editorial-enter"
                    style={style}
                  >
                    <h3 className="text-lg font-semibold leading-tight tracking-[-0.01em] text-foreground m-0">
                      {post.title}
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-y-1.5 gap-x-2.5 text-xs text-muted-foreground tabular-nums [&>*+*]:before:content-['·'] [&>*+*]:before:mr-2.5 [&>*+*]:before:text-muted-foreground [&_a]:text-muted-foreground [&_a]:no-underline [&_a]:hover:text-foreground">
                      <time dateTime={new Date(post.date).toISOString()}>
                        {dateFormat(post.date, "MMM d, yyyy")}
                      </time>
                      {post.category && <span>{post.category}</span>}
                    </div>
                  </Link>
                );
              })}
            </section>
          </div>
        ))}

      {posts.length === 0 && (
        <p className="mx-auto mt-12 max-w-2xl text-center text-sm text-[color:var(--em-muted)]">
          No posts found with this tag yet.
        </p>
      )}
    </div>
  );
}
