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
            {series.posts.length} {series.posts.length === 1 ? "post" : "posts"}
          </span>
        </div>
      </header>

      <div className="rd-rows" aria-label="Series posts">
        {series.posts.map((post, i) => (
          <Link
            key={post.slug}
            to="/$year/$month/$slug/"
            params={postParams(post)}
            className="rd-row cursor-pointer no-underline text-inherit"
            style={{ gridTemplateColumns: "auto 1fr auto" }}
          >
            <span className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-base leading-none tabular-nums w-[28px]">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="truncate">
              <span className="font-[550] text-[clamp(14px,1.4vw,16px)] tracking-tight">
                {post.title}
              </span>
              {post.excerpt && (
                <>
                  <span className="text-[var(--rd-text-3)] mx-1.5">—</span>
                  <span className="text-[var(--rd-text-2)] text-[13px]">{post.excerpt}</span>
                </>
              )}
            </span>
            <span className="text-[var(--rd-text-2)] text-[13px] shrink-0 ml-2 tabular-nums">
              {dateFormat(post.date, "MMM d, yyyy")}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
