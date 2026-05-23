import type { Post } from "@duyet/interfaces";
import { dateFormat } from "@duyet/libs/date";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { CSSProperties, ReactElement } from "react";
import { getPostsByAllYear } from "@/lib/posts";

export const Route = createFileRoute("/archives")({
  head: () => ({
    meta: [
      { title: "Archives | Tôi là Duyệt" },
      { name: "description", content: "All blog posts archived by year." },
    ],
  }),
  loader: async () => {
    const postsByYear = await getPostsByAllYear();
    return { postsByYear };
  },
  component: Archives,
});

function postParams(post: Post) {
  const [, year, month, slug] = post.slug.split("/");
  return { year, month, slug };
}

function Archives(): ReactElement {
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
  const years = Object.keys(postsByYear).map(Number);
  const pastYears = years.length
    ? new Date().getFullYear() - Math.min(...years)
    : 0;

  return (
    <div className="px-6 md:px-8">
      <header className="em-masthead">
        <span className="em-masthead__eyebrow">Archive</span>
        <h1 className="em-masthead__title">Everything written</h1>
        <p className="em-masthead__dek">
          {postCount} posts across the last {pastYears} years. Or explore{" "}
          <Link
            to="/tags/"
            className="underline decoration-[color:var(--em-hairline)] decoration-1 underline-offset-4 transition-colors hover:text-[color:var(--em-foreground)] hover:decoration-[color:var(--em-accent)]"
          >
            by topic
          </Link>
          .
        </p>
      </header>

      {yearEntries.map(([year, posts]) => (
        <YearBlock key={year} year={Number(year)} posts={posts} />
      ))}
    </div>
  );
}

function YearBlock({
  year,
  posts,
}: {
  year: number;
  posts: Post[];
}): ReactElement | null {
  if (!posts.length) return null;
  return (
    <>
      <h2 className="em-year">{year}</h2>
      <section className="em-list" aria-label={`Posts from ${year}`}>
        {posts.map((post, i) => {
          const style: CSSProperties = {
            animationDelay: `${Math.min(i, 8) * 30}ms`,
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
              <div className="em-list__meta">
                <time dateTime={new Date(post.date).toISOString()}>
                  {dateFormat(post.date, "MMM d")}
                </time>
                {post.category && <span>{post.category}</span>}
              </div>
            </Link>
          );
        })}
      </section>
    </>
  );
}
