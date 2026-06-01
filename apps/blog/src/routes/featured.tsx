import type { Post } from "@duyet/interfaces";
import { dateFormat } from "@duyet/libs/date";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { CSSProperties, ReactElement } from "react";
import { getPostsByAllYear } from "@/lib/posts";

export const Route = createFileRoute("/featured")({
  head: () => ({
    meta: [
      { title: "Featured Posts | Tôi là Duyệt" },
      { name: "description", content: "Featured blog posts." },
    ],
  }),
  loader: async () => {
    const postsByYear = await getPostsByAllYear(true);
    return { postsByYear };
  },
  component: Featured,
});

function postParams(post: Post) {
  const [, year, month, slug] = post.slug.split("/");
  return { year, month, slug };
}

function Featured(): ReactElement {
  const { postsByYear } = Route.useLoaderData() as {
    postsByYear: Record<number, Post[]>;
  };

  const yearEntries = Object.entries(postsByYear).sort(
    ([a], [b]) => Number.parseInt(b, 10) - Number.parseInt(a, 10)
  );
  const postCount = Object.values(postsByYear).reduce(
    (acc, p) => acc + p.length,
    0
  );

  return (
    <div className="px-6 md:px-8">
      <header className="pt-24 md:pt-28 pb-10 mx-auto">
        <span className="inline-block text-[0.6875rem] font-medium tracking-[0.16em] uppercase text-muted-foreground mb-3.5">
          Featured
        </span>
        <h1 className="text-[clamp(2.25rem,4.5vw,3.25rem)] font-semibold leading-[1.08] tracking-[-0.018em] text-foreground m-0">
          Worth reading first
        </h1>
        <p className="mt-4 text-base leading-[1.6] text-muted-foreground max-w-xl">
          {postCount} hand-picked posts. Or browse{" "}
          <Link
            to="/"
            className="underline decoration-[color:var(--em-hairline)] decoration-1 underline-offset-4 transition-colors hover:text-[color:var(--em-foreground)] hover:decoration-[color:var(--em-accent)]"
          >
            everything
          </Link>{" "}
          or{" "}
          <Link
            to="/tags/"
            className="underline decoration-[color:var(--em-hairline)] decoration-1 underline-offset-4 transition-colors hover:text-[color:var(--em-foreground)] hover:decoration-[color:var(--em-accent)]"
          >
            by topic
          </Link>
          .
        </p>
      </header>

      {yearEntries.map(([year, posts]) => {
        if (!posts.length) return null;
        return (
          <div key={year}>
            <h2 className="max-w-2xl mx-auto mt-12 pb-2 text-lg font-medium text-muted-foreground tabular-nums tracking-[0.04em]">
              {year}
            </h2>
            <section
              className="max-w-2xl mx-auto pt-6"
              aria-label={`Featured posts from ${year}`}
            >
              {posts.map((post, i) => {
                const style: CSSProperties = {
                  animationDelay: `${Math.min(i, 8) * 50}ms`,
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
                    {post.excerpt && (
                      <p className="mt-1.5 text-[0.9375rem] leading-normal text-muted-foreground line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
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
        );
      })}
    </div>
  );
}
