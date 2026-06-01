import type { TagCount } from "@duyet/interfaces";
import { getSlug } from "@duyet/libs/getSlug";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { CSSProperties, ReactElement } from "react";
import { PALETTE } from "@/lib/colors";
import { getAllTags } from "@/lib/posts";
import { getTagMetadata } from "@/lib/tag-metadata";

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

// Bento emphasis tiers are data-driven so layout stays stable across builds.
const FEATURE_LIMIT = 3;
const FEATURE_RATIO = 0.7;

function Tags(): ReactElement {
  const { tags } = Route.useLoaderData() as { tags: TagCount };
  const entries = Object.entries(tags).sort(([, a], [, b]) => b - a);
  const totalPosts = entries.reduce((sum, [, c]) => sum + c, 0);
  const maxCount = entries[0]?.[1] ?? 0;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
      <header className="pt-24 md:pt-28 pb-10 mx-auto">
        <span className="inline-block text-[0.6875rem] font-medium tracking-[0.16em] uppercase text-muted-foreground mb-3.5">
          Index
        </span>
        <h1 className="text-[clamp(2.25rem,4.5vw,3.25rem)] font-semibold leading-[1.08] tracking-[-0.018em] text-foreground m-0">
          Topics
        </h1>
        <p className="mt-4 text-base leading-[1.6] text-muted-foreground max-w-xl">
          {entries.length} tags across {totalPosts} posts.
        </p>
      </header>

      {entries.length === 0 ? (
        <p className="font-mono text-sm text-muted-foreground">No tags yet.</p>
      ) : (
        <div
          className="grid grid-flow-row-dense grid-cols-2 gap-px border border-border bg-border sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          aria-label="All tags"
        >
          {entries.map(([tag, count], i) => {
            const isFeature =
              i < FEATURE_LIMIT && count >= maxCount * FEATURE_RATIO;
            const meta = isFeature ? getTagMetadata(tag, count, i) : null;
            const color = PALETTE[i % PALETTE.length];
            const style: CSSProperties = {
              animationDelay: `${Math.min(i, 20) * 20}ms`,
            };

            return (
              <Link
                key={tag}
                to="/tag/$tag/"
                params={{ tag: getSlug(tag) }}
                className={`editorial-enter group block transition-colors focus-visible:outline-none ${
                  isFeature
                    ? "bg-card hover:bg-muted/60 focus-visible:bg-muted/60 sm:col-span-2"
                    : "bg-background hover:bg-muted/60 focus-visible:bg-muted/60"
                }`}
                style={style}
              >
                {isFeature ? (
                  <div className="flex h-full flex-col justify-between gap-3 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="truncate text-lg font-medium tracking-tight text-foreground">
                          {tag}
                        </span>
                      </div>
                      <span className="shrink-0 font-mono text-lg tabular-nums text-foreground">
                        {count}
                      </span>
                    </div>
                    <div className="flex items-end justify-between gap-3">
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {meta?.description}
                      </p>
                      <span className="shrink-0 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                        posts
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-between gap-3 p-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="truncate text-sm font-medium tracking-tight text-foreground">
                        {tag}
                      </span>
                    </div>
                    <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
                      {String(count).padStart(2, "0")}
                    </span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
