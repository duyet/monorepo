import type { Post, Series } from "@duyet/interfaces";
import { dateFormat } from "@duyet/libs/date";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import type { CSSProperties, ReactElement } from "react";
import { getAllSeries, getSeries } from "@/lib/posts";

export const Route = createFileRoute("/series/$slug")({
  head: ({ params }) => ({
    meta: [{ title: `${params.slug} Series | Tôi là Duyệt` }],
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

function postParams(post: Post) {
  const [, year, month, slug] = post.slug.split("/");
  return { year, month, slug };
}

function childParams(post: Post) {
  const segments = post.slug.replace(/^\//, "").split("/");
  return { year: segments[0], month: segments[1], slug: segments[2], child: segments[3] };
}

type TreeNode = {
  post: Post;
  children: Post[];
};

function buildTree(posts: Post[]): TreeNode[] {
  const childrenByParent = new Map<string, Post[]>();
  const parents: Post[] = [];

  for (const post of posts) {
    const segments = post.slug.split("/").filter(Boolean);
    if (segments.length >= 4) {
      const parentSlug = `/${segments.slice(0, 3).join("/")}`;
      if (!childrenByParent.has(parentSlug)) {
        childrenByParent.set(parentSlug, []);
      }
      childrenByParent.get(parentSlug)!.push(post);
    } else {
      parents.push(post);
    }
  }

  parents.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return parents.map((post) => ({
    post,
    children: childrenByParent.get(post.slug) ?? [],
  }));
}

function SeriesDetailPage(): ReactElement {
  const { series } = Route.useLoaderData() as { series: Series | null };

  if (!series) {
    return (
      <div className="px-6 md:px-8">
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
    <div className="px-6 md:px-8">
      <header className="pt-24 md:pt-28 pb-10 mx-auto">
        <span className="inline-block text-[0.6875rem] font-medium tracking-[0.16em] uppercase text-muted-foreground mb-3.5">
          <Link
            to="/series/"
            className="transition-colors hover:text-[color:var(--em-foreground)]"
          >
            Series
          </Link>
        </span>
        <h1 className="text-[clamp(2.25rem,4.5vw,3.25rem)] font-semibold leading-[1.08] tracking-[-0.018em] text-foreground m-0">
          {series.name}
        </h1>
        <div className="mt-5 flex flex-wrap items-center gap-y-2 gap-x-3 text-[0.8125rem] text-muted-foreground tabular-nums [&>*+*]:before:content-['·'] [&>*+*]:before:mr-3 [&>*+*]:before:text-muted-foreground">
          <span>
            {tree.length} {tree.length === 1 ? "post" : "posts"}
            {childCount > 0 && (
              <span className="text-muted-foreground/60">
                {" "}(+{childCount} {childCount === 1 ? "child" : "children"})
              </span>
            )}
          </span>
        </div>
      </header>

      <section className="max-w-2xl mx-auto" aria-label="Series posts">
        {tree.map((node, i) => {
          const style: CSSProperties = {
            animationDelay: `${Math.min(i, 8) * 40}ms`,
          };
          return (
            <div
              key={node.post.slug}
              className="mb-3 bg-card border border-border rounded-[var(--radius)] overflow-hidden editorial-enter"
              style={style}
            >
              {/* Parent post */}
              <Link
                to="/$year/$month/$slug/"
                params={postParams(node.post)}
                className="block px-4 py-5 no-underline text-inherit transition-colors hover:bg-muted focus-visible:outline-none focus-visible:bg-muted"
              >
                <div className="flex items-baseline gap-3">
                  <span className="font-[var(--font-mono)] text-xs text-muted-foreground tabular-nums shrink-0 pt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold leading-tight tracking-[-0.01em] text-foreground m-0">
                      {node.post.title}
                    </h3>
                    {node.post.excerpt && (
                      <p className="mt-1 text-sm leading-[1.55] text-muted-foreground line-clamp-2">
                        {node.post.excerpt}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-y-1.5 gap-x-2.5 text-xs text-muted-foreground tabular-nums [&>*+*]:before:content-['·'] [&>*+*]:before:mr-2.5">
                      <time dateTime={new Date(node.post.date).toISOString()}>
                        {dateFormat(node.post.date, "MMM d, yyyy")}
                      </time>
                      {node.children.length > 0 && (
                        <span>
                          {node.children.length}{" "}
                          {node.children.length === 1 ? "part" : "parts"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>

              {/* Child posts */}
              {node.children.length > 0 && (
                <div className="border-t border-border">
                  {node.children.map((child) => (
                    <Link
                      key={child.slug}
                      to="/$year/$month/$slug/$child/"
                      params={childParams(child)}
                      className="flex items-baseline gap-2.5 px-4 py-3 pl-[2.85rem] no-underline text-inherit border-b border-border last:border-b-0 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:bg-muted"
                    >
                      <span className="min-w-0 flex-1 truncate text-sm font-medium tracking-[-0.005em] text-foreground/90">
                        {child.title}
                      </span>
                      <time
                        dateTime={new Date(child.date).toISOString()}
                        className="shrink-0 text-xs text-muted-foreground tabular-nums"
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
          <p className="mt-12 text-center text-sm text-muted-foreground">
            No posts in this series yet.
          </p>
        )}
      </section>
    </div>
  );
}
