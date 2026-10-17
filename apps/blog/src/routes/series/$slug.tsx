import type { Series } from "@duyet/interfaces";
import { dateFormat } from "@duyet/libs/date";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import type { CSSProperties, ReactElement } from "react";
import { buildListHead } from "@/lib/head";
import { getAllSeries, getSeries } from "@/lib/posts";
import { buildTree } from "@/lib/post-tree";
import { childParams, postParams } from "@/lib/post-params";

export const Route = createFileRoute("/series/$slug")({
  head: ({ params }) =>
    buildListHead({
      title: `${params.slug} Series`,
      path: `/series/${params.slug}`,
    }),
  loader: async ({ params }) => {
    const [allSeries, series] = await Promise.all([
      getAllSeries(),
      getSeries({ slug: params.slug }),
    ]);
    const found = allSeries.some((s) => s.slug === params.slug);
    if (!found) throw notFound();
    return { series };
  },
  component: SeriesDetailPage,
});

function SeriesDetailPage(): ReactElement {
  const { series } = Route.useLoaderData() as { series: Series | null };

  if (!series) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <header className="pt-24 md:pt-28 pb-10 mx-auto">
          <span className="inline-block text-[0.6875rem] font-medium tracking-[0.16em] uppercase text-muted-foreground mb-3.5">
            Series
          </span>
          <h1 className="text-[clamp(2.25rem,4.5vw,3.25rem)] font-semibold leading-[1.08] tracking-[-0.018em] text-foreground m-0">
            Not found
          </h1>
          <p className="mt-4 text-base leading-[1.6] text-muted-foreground max-w-xl">
            This series doesn't exist (yet).
          </p>
        </header>
      </div>
    );
  }

  const tree = buildTree(series.posts);
  const childCount = tree.reduce((sum, n) => sum + n.children.length, 0);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
      <header className="pt-24 md:pt-28 pb-10 mx-auto">
        <Link
          to="/series/"
          className="inline-block text-[0.6875rem] font-medium tracking-[0.16em] uppercase text-muted-foreground mb-3.5 no-underline transition-colors hover:text-foreground"
        >
          Series
        </Link>
        <h1 className="text-[clamp(2.25rem,4.5vw,3.25rem)] font-semibold leading-[1.08] tracking-[-0.018em] text-foreground m-0">
          {series.name}
        </h1>
        <p className="mt-4 font-mono text-xs text-muted-foreground tabular-nums">
          {tree.length} {tree.length === 1 ? "post" : "posts"}
          {childCount > 0 && (
            <>
              {" · "}
              {childCount} {childCount === 1 ? "part" : "parts"}
            </>
          )}
        </p>
      </header>

      <section
        className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 mb-16"
        aria-label="Series posts"
      >
        {tree.map((node, i) => {
          const hasChildren = node.children.length > 0;
          const style: CSSProperties = {
            animationDelay: `${Math.min(i, 8) * 40}ms`,
          };
          return (
            <div
              key={node.post.slug}
              className={`editorial-enter flex flex-col bg-background ${hasChildren ? "sm:col-span-2" : ""}`}
              style={style}
            >
              {/* Parent post */}
              <Link
                to="/$year/$month/$slug/"
                params={postParams(node.post)}
                className="group block px-5 py-5 no-underline text-inherit transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:bg-muted/60"
              >
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-xs text-muted-foreground/60 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold leading-tight tracking-[-0.01em] text-foreground m-0">
                      {node.post.title}
                    </h3>
                    {node.post.excerpt && (
                      <p className="mt-1.5 text-sm leading-[1.55] text-muted-foreground line-clamp-2">
                        {node.post.excerpt}
                      </p>
                    )}
                    <div className="mt-2.5 font-mono text-xs text-muted-foreground tabular-nums">
                      <time dateTime={new Date(node.post.date).toISOString()}>
                        {dateFormat(node.post.date, "MMM d, yyyy")}
                      </time>
                      {hasChildren && (
                        <>
                          {" · "}
                          {node.children.length}{" "}
                          {node.children.length === 1 ? "part" : "parts"}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Link>

              {/* Child posts */}
              {hasChildren && (
                <div className="grid grid-cols-1 gap-px bg-border border-t border-border md:grid-cols-2">
                  {node.children.map((child) => (
                    <Link
                      key={child.slug}
                      to="/$year/$month/$slug/$child/"
                      params={childParams(child)}
                      className="flex items-baseline gap-3 bg-background px-5 py-3 no-underline text-inherit transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:bg-muted/60"
                    >
                      <span className="min-w-0 flex-1 truncate text-sm text-foreground/90">
                        {child.title}
                      </span>
                      <time
                        dateTime={new Date(child.date).toISOString()}
                        className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums"
                      >
                        {dateFormat(child.date, "MMM d, yyyy")}
                      </time>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {tree.length === 0 && (
          <p className="sm:col-span-2 bg-background py-12 text-center text-sm text-muted-foreground">
            No posts in this series yet.
          </p>
        )}
      </section>
    </div>
  );
}
