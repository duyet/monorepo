import type { Post } from "@duyet/interfaces";
import { dateFormat } from "@duyet/libs/date";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactElement } from "react";
import { yearColor } from "@/lib/colors";
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

  const years = Object.keys(postsByYear)
    .map((y) => Number.parseInt(y, 10))
    .sort((a, b) => b - a);

  const totalPosts = years.reduce(
    (sum, y) => sum + postsByYear[y].length,
    0
  );

  return (
    <div>
      {/* Hero */}
      <header className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          ARCHIVE
        </p>
        <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">
          Articles by year
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          {totalPosts} posts across {years.length} years.
        </p>
      </header>

      {/* Year-grouped tables */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-24">
        {years.map((year) => {
          const posts = [...postsByYear[year]].sort(
            (a, b) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          return (
            <section key={year} className="mt-12 first:mt-0">
              <div className="flex items-baseline justify-between border-b pb-3">
                <h2
                  className="text-3xl md:text-4xl font-bold tracking-tight tabular-nums"
                  style={{ color: yearColor(year) }}
                >
                  {year}
                </h2>
                <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  {posts.length} {posts.length === 1 ? "post" : "posts"}
                </span>
              </div>
              <ul className="divide-y">
                {posts.map((post) => (
                  <li
                    key={post.slug}
                    className="grid grid-cols-[80px_1fr] md:grid-cols-[120px_1fr_120px] items-baseline gap-4 py-4"
                  >
                    <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground tabular-nums">
                      {dateFormat(new Date(post.date), "MMM d")}
                    </span>
                    <Link
                      to="/$year/$month/$slug/"
                      params={postParams(post)}
                      className="text-base font-medium tracking-tight hover:text-muted-foreground transition-colors"
                    >
                      {post.title}
                    </Link>
                    <span className="hidden md:block text-xs text-muted-foreground text-right truncate">
                      {post.category}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
