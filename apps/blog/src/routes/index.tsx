import { Badge } from "@duyet/components";
import type { Post } from "@duyet/interfaces";
import { dateFormat, distanceToNow } from "@duyet/libs/date";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactElement } from "react";
import { getPostsByAllYear } from "@/lib/posts";
import type { Shortform } from "@/lib/shortforms";
import { getShortforms } from "@/lib/shortforms";

export const Route = createFileRoute("/")({
  loader: async () => {
    const postsByYear = await getPostsByAllYear();
    const shortforms = getShortforms(3);
    return { postsByYear, shortforms };
  },
  component: HomePage,
});

function postParams(post: Post) {
  const [, year, month, slug] = post.slug.split("/");
  return { year, month, slug };
}

function formatPostDate(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  return dateFormat(d, "MMM d, yyyy");
}

function HomePage(): ReactElement {
  const { postsByYear, shortforms } = Route.useLoaderData();

  const years = Object.keys(postsByYear)
    .map((y) => Number.parseInt(y, 10))
    .sort((a, b) => b - a);

  const allPosts: Post[] = years.flatMap((y) =>
    [...postsByYear[y]].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  );

  const featured = allPosts[0];
  const featuredSlug = featured?.slug;

  return (
    <div>
      {/* Featured first post */}
      {featured && (
        <section className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <article>
            <Link
              to="/$year/$month/$slug/"
              params={postParams(featured)}
              className="block aspect-[21/9] overflow-hidden rounded-lg bg-muted group"
            >
              {featured.thumbnail && (
                <img
                  src={featured.thumbnail}
                  alt={featured.title}
                  className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
                />
              )}
            </Link>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
              <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium">
                {featured.category}
              </span>
              <span className="text-muted-foreground">
                {formatPostDate(featured.date)}
              </span>
            </div>
            <h2 className="mt-4 text-2xl md:text-3xl font-bold tracking-tight">
              <Link to="/$year/$month/$slug/" params={postParams(featured)}>
                {featured.title}
              </Link>
            </h2>
            {featured.excerpt && (
              <p className="mt-3 text-base text-muted-foreground leading-relaxed max-w-3xl">
                {featured.excerpt}
              </p>
            )}
            <div className="mt-6 flex items-center gap-3">
              <img
                src="https://github.com/duyet.png"
                alt="Duyet Le"
                className="h-10 w-10 rounded-full bg-muted border"
              />
              <div>
                <p className="text-sm font-medium">Duyet Le</p>
                <p className="text-xs text-muted-foreground">
                  Data & AI Engineer
                </p>
              </div>
            </div>
          </article>
        </section>
      )}

      {/* Quick Notes */}
      <section className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-12 md:py-16 border-t">
        <div className="mb-10">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Quick Notes
          </h2>
          <p className="mt-2 text-base text-muted-foreground">
            Short-form thoughts and updates.
          </p>
        </div>
        {shortforms.length > 0 ? (
          <ul className="max-w-3xl space-y-10">
            {shortforms.map((note: Shortform) => (
              <li key={note.id} className="flex items-start gap-4">
                <div className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                  DL
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Duyet Le</span>
                    <span className="text-muted-foreground">
                      {distanceToNow(note.date)}
                    </span>
                  </div>
                  <p className="mt-2 text-base leading-relaxed">{note.body}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="max-w-3xl rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No notes yet. Short-form thoughts will appear here.
            </p>
          </div>
        )}
      </section>

      {/* Posts by year */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 md:py-16 border-t">
        <div className="mb-10">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Posts by year
          </h2>
          <p className="mt-2 text-base text-muted-foreground">
            {allPosts.length} posts across {years.length} years.
          </p>
        </div>
        <div>
          {years.map((year) => {
            const posts = [...postsByYear[year]]
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              )
              .filter((p) => p.slug !== featuredSlug);
            if (posts.length === 0) return null;
            return (
              <section key={year} className="mt-12 first:mt-0">
                <div className="flex items-baseline justify-between border-b pb-3">
                  <h3 className="text-2xl md:text-3xl font-bold tracking-tight tabular-nums">
                    {year}
                  </h3>
                  <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                    {posts.length} {posts.length === 1 ? "post" : "posts"}
                  </span>
                </div>
                <ul className="divide-y">
                  {posts.map((post) => (
                    <li
                      key={post.slug}
                      className="grid grid-cols-[1fr_auto] md:grid-cols-[1fr_auto_auto_auto] items-center gap-x-4 md:gap-x-8 py-5"
                    >
                      <Link
                        to="/$year/$month/$slug/"
                        params={postParams(post)}
                        className="text-base md:text-lg font-medium tracking-tight hover:text-muted-foreground transition-colors"
                      >
                        {post.title}
                      </Link>
                      <Badge
                        variant="secondary"
                        className="hidden md:inline-flex"
                      >
                        {post.category}
                      </Badge>
                      {post.readingTime ? (
                        <span className="hidden md:block text-sm text-muted-foreground tabular-nums">
                          {Math.max(1, Math.round(post.readingTime))} min
                        </span>
                      ) : (
                        <span className="hidden md:block" />
                      )}
                      <span className="text-sm text-muted-foreground tabular-nums whitespace-nowrap">
                        {formatPostDate(post.date)}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </section>

      {/* Archive link */}
      <div className="flex justify-center py-12 border-t">
        <Link
          to="/archives/"
          className="inline-flex items-center gap-2 rounded-full border border-border hover:border-foreground px-6 py-2.5 text-xs font-mono uppercase tracking-widest text-foreground hover:bg-muted transition-all group"
        >
          <span>See full archive</span>
          <span className="group-hover:translate-x-0.5 transition-transform duration-200">
            →
          </span>
        </Link>
      </div>
    </div>
  );
}
