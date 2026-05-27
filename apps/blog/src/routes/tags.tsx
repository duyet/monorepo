import type { TagCount } from "@duyet/interfaces";
import { Card, CardContent } from "@duyet/components";
import { getSlug } from "@duyet/libs/getSlug";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { CSSProperties, ReactElement } from "react";
import { getAllTags } from "@/lib/posts";

export const Route = createFileRoute("/tags")({
  head: () => ({
    meta: [
      { title: "Topics | Tôi là Duyệt" },
      { name: "description", content: "Browse posts by topics and tags." },
    ],
  }),
  loader: async () => {
    const tags = await getAllTags();
    return { tags };
  },
  component: Tags,
});

function Tags(): ReactElement {
  const { tags } = Route.useLoaderData() as { tags: TagCount };
  const entries = Object.entries(tags).sort(([, a], [, b]) => b - a);
  const totalPosts = entries.reduce((sum, [, c]) => sum + c, 0);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
      <header className="em-masthead">
        <span className="em-masthead__eyebrow">Index</span>
        <h1 className="em-masthead__title">Topics</h1>
        <p className="em-masthead__dek">
          {entries.length} tags across {totalPosts} posts.
        </p>
      </header>

      <div
        className="grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-3 lg:grid-cols-4"
        aria-label="All tags"
      >
        {entries.map(([tag, count], i) => {
          const style: CSSProperties = {
            animationDelay: `${Math.min(i, 20) * 20}ms`,
          };
          return (
            <Link
              key={tag}
              to="/tag/$tag/"
              params={{ tag: getSlug(tag) }}
              className="editorial-enter group block bg-background transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none"
              style={style}
            >
              <Card className="h-full rounded-none border-0 bg-transparent">
                <CardContent className="flex h-full items-center justify-between gap-3 p-4">
                  <span className="truncate text-sm font-medium tracking-tight text-foreground group-hover:text-foreground">
                    {tag}
                  </span>
                  <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
                    {String(count).padStart(2, "0")}
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
