import type { Post } from "@duyet/interfaces";
import { dateFormat, distanceToNow } from "@duyet/libs/date";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactElement } from "react";
import { getPostsByAllYear } from "@/lib/posts";
import { getShortforms } from "@/lib/shortforms";
import type { Shortform } from "@/lib/shortforms";

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

  const allPosts: Post[] = Object.entries(postsByYear)
    .sort(([a], [b]) => Number(b) - Number(a))
    .flatMap(([, posts]) => posts);

  const featured = allPosts[0];
  const restPosts = allPosts.slice(1);

  return (
    <div>
      {/* Centered hero block */}
      <header className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          duyet · blog
        </p>
        <h1 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight">
          Notes from the workshop
        </h1>
        <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Field notes on ClickHouse, Cloudflare, AI agents, and the small
          engineering details that ship to production.
        </p>
      </header>

      {/* Featured first post */}
      {featured && (
        <section className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-12 md:py-16 border-t">
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
      {shortforms.length > 0 && (
        <section className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-12 md:py-16 border-t">
          <div className="mb-10">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Quick Notes</h2>
            <p className="mt-2 text-base text-muted-foreground">Short-form thoughts and updates.</p>
          </div>
          <ul className="max-w-3xl space-y-10">
            {shortforms.map((note: Shortform) => (
              <li key={note.id} className="flex items-start gap-4">
                <div className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                  DL
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Duyet Le</span>
                    <span className="text-muted-foreground">{distanceToNow(note.date)}</span>
                  </div>
                  <p className="mt-2 text-base leading-relaxed">{note.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 3-col post grid */}
      <section className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-12 md:py-16 border-t">
        <div className="mb-10">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Latest Posts
          </h2>
          <p className="mt-2 text-base text-muted-foreground">
            Field notes from the workshop — data infrastructure, AI agents, and
            the small details.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {restPosts.map((post) => (
            <article key={post.slug}>
              {post.thumbnail ? (
                <Link
                  to="/$year/$month/$slug/"
                  params={postParams(post)}
                  className="block aspect-video overflow-hidden rounded-lg bg-muted group"
                >
                  <img
                    src={post.thumbnail}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
                  />
                </Link>
              ) : (
                <Link
                  to="/$year/$month/$slug/"
                  params={postParams(post)}
                  className="block aspect-video bg-muted rounded-lg"
                />
              )}
              <div className="mt-5 flex items-center gap-3 text-sm">
                <span className="font-medium">{post.category}</span>
                {post.readingTime && (
                  <>
                    <span className="text-muted-foreground" aria-hidden>
                      ·
                    </span>
                    <span className="text-muted-foreground">
                      {Math.max(1, Math.round(post.readingTime))} min
                    </span>
                  </>
                )}
              </div>
              <h3 className="mt-3 text-xl font-semibold tracking-tight leading-snug">
                <Link to="/$year/$month/$slug/" params={postParams(post)}>
                  {post.title}
                </Link>
              </h3>
              {post.excerpt && (
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {post.excerpt}
                </p>
              )}
              <div className="mt-5 flex items-center gap-3">
                <img
                  src="https://github.com/duyet.png"
                  alt="Duyet Le"
                  className="h-7 w-7 rounded-full bg-muted border"
                />
                <span className="text-sm">Duyet Le</span>
                <span className="text-muted-foreground" aria-hidden>
                  ·
                </span>
                <span className="text-sm text-muted-foreground">
                  {formatPostDate(post.date)}
                </span>
              </div>
            </article>
          ))}
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
