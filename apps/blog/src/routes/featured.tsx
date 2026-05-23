import { dateFormat } from "@duyet/libs/date";
import type { Post } from "@duyet/interfaces";
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
      <header className="em-masthead">
        <span className="em-masthead__eyebrow">Featured</span>
        <h1 className="em-masthead__title">Worth reading first</h1>
        <p className="em-masthead__dek">
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
            <h2 className="em-year">{year}</h2>
            <section className="em-list" aria-label={`Featured posts from ${year}`}>
              {posts.map((post, i) => {
                const style: CSSProperties = {
                  animationDelay: `${Math.min(i, 8) * 50}ms`,
                };
                return (
                  <Link
                    key={post.slug}
                    to="/$year/$month/$slug/"
                    params={postParams(post)}
                    className="em-list__row editorial-enter"
                    style={style}
                  >
                    <h3 className="em-list__title">{post.title}</h3>
                    {post.excerpt && (
                      <p className="em-list__dek">{post.excerpt}</p>
                    )}
                    <div className="em-list__meta">
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
