import type { Post } from "@duyet/interfaces";
import { dateFormat } from "@duyet/libs/date";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactElement } from "react";
import { getPostsByAllYear } from "@/lib/posts";

export const Route = createFileRoute("/")({
  loader: async () => {
    const postsByYear = await getPostsByAllYear();
    return { postsByYear };
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
  const { postsByYear } = Route.useLoaderData();

  const filteredPosts: Post[] = Object.entries(postsByYear)
    .sort(([a], [b]) => Number(b) - Number(a))
    .flatMap(([, posts]) => posts);

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

      {/* 2-col post grid */}
      <div className="border-t">
        <ul className="mx-auto max-w-[1200px] grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:[&>li:nth-child(odd)]:border-r">
          {filteredPosts.map((post, idx) => (
            <li key={post.slug} className="p-6 md:p-10">
              {idx === 0 && post.thumbnail && (
                <div className="aspect-[4/3] overflow-hidden bg-muted mb-6">
                  <img
                    src={post.thumbnail}
                    alt={post.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                {post.category} · {formatPostDate(post.date)}
              </p>
              <h2 className="mt-3 text-xl md:text-2xl font-semibold tracking-tight">
                <Link to="/$year/$month/$slug/" params={postParams(post)}>
                  {post.title}
                </Link>
              </h2>
              {post.excerpt && (
                <p className="mt-3 text-sm text-muted-foreground line-clamp-3">
                  {post.excerpt}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>

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
