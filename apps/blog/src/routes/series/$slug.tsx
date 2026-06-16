import type { Post, Series } from "@duyet/interfaces";
import { dateFormat } from "@duyet/libs/date";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import type { ReactElement } from "react";
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

      <div className="rd-rows" aria-label="Series posts">
        {tree.map((node, i) => (
          <div key={node.post.slug}>
            {/* Parent row */}
            <Link
              to="/$year/$month/$slug/"
              params={postParams(node.post)}
              className="rd-row cursor-pointer no-underline text-inherit"
              style={{ gridTemplateColumns: "auto 1fr auto" }}
            >
              <span className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-base leading-none tabular-nums w-[28px]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="truncate">
                <span className="font-[550] text-[clamp(14px,1.4vw,16px)] tracking-tight">
                  {node.post.title}
                </span>
                {node.post.excerpt && (
                  <>
                    <span className="text-[var(--rd-text-3)] mx-1.5">—</span>
                    <span className="text-[var(--rd-text-2)] text-[13px]">{node.post.excerpt}</span>
                  </>
                )}
              </span>
              <span className="text-[var(--rd-text-2)] text-[13px] shrink-0 ml-2 tabular-nums">
                {dateFormat(node.post.date, "MMM d, yyyy")}
              </span>
            </Link>

            {/* Children indented under parent */}
            {node.children.length > 0 && (
              <div className="border-l-2 border-[var(--rd-border)] ml-[34px] pl-5 mt-1 mb-1 space-y-1">
                {node.children.map((child) => (
                  <Link
                    key={child.slug}
                    to="/$year/$month/$slug/$child/"
                    params={childParams(child)}
                    className="rd-row cursor-pointer no-underline text-inherit"
                    style={{
                      gridTemplateColumns: "1fr auto",
                      paddingTop: "6px",
                      paddingBottom: "6px",
                    }}
                  >
                    <span className="truncate">
                      <span className="font-[500] text-[clamp(13px,1.3vw,14.5px)] tracking-tight text-[var(--rd-text-2)]">
                        {child.title}
                      </span>
                      {child.excerpt && (
                        <>
                          <span className="text-[var(--rd-text-4)] mx-1.5">—</span>
                          <span className="text-[var(--rd-text-3)] text-[12.5px]">{child.excerpt}</span>
                        </>
                      )}
                    </span>
                    <span className="text-[var(--rd-text-3)] text-[12px] shrink-0 ml-2 tabular-nums">
                      {dateFormat(child.date, "MMM d, yyyy")}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
