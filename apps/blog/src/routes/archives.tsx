import type { Post } from "@duyet/interfaces";
import { Badge, Input } from "@duyet/components";
import { dateFormat } from "@duyet/libs/date";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
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

  const [query, setQuery] = useState("");

  const allPosts: Post[] = Object.entries(postsByYear)
    .sort(([a], [b]) => Number.parseInt(a, 10) - Number.parseInt(b, 10))
    .flatMap(([, posts]) => posts);

  const filtered = query
    ? allPosts.filter((p) =>
        p.title.toLowerCase().includes(query.toLowerCase())
      )
    : allPosts;

  return (
    <div>
      {/* Hero */}
      <header className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          ARCHIVE
        </p>
        <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">
          Search Articles
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          All posts, oldest first below — type a query to filter by title
        </p>
      </header>

      {/* Search input */}
      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 mb-12">
        <Search className="absolute left-7 sm:left-9 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search by title…"
          className="pl-10 h-12"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <p className="text-center py-12 text-muted-foreground">
          No articles match &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <div className="mx-auto max-w-[1200px] grid grid-cols-1 md:grid-cols-2 gap-0 border-t divide-y md:divide-y-0 md:[&>article:nth-child(odd)]:border-r">
          {filtered.map((post) => (
            <article key={post.slug} className="p-6 md:p-10">
              <h3 className="text-xl font-semibold tracking-tight">
                <Link
                  to="/$year/$month/$slug/"
                  params={postParams(post)}
                >
                  {post.title}
                </Link>
              </h3>
              {post.excerpt && (
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {post.excerpt}
                </p>
              )}
              <div className="mt-4 flex items-center gap-3 text-sm">
                <Badge variant="secondary">{post.category}</Badge>
                <span className="text-muted-foreground">
                  {dateFormat(new Date(post.date), "MMM d, yyyy")}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
