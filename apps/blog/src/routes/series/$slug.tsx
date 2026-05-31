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
        <header className="em-masthead">
          <span className="em-masthead__eyebrow">Series</span>
          <h1 className="em-masthead__title">Not found</h1>
          <p className="em-masthead__dek">This series doesn't exist (yet).</p>
        </header>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-8">
      <header className="em-masthead">
        <span className="em-masthead__eyebrow">
          <Link
            to="/series/"
            className="transition-colors hover:text-[color:var(--em-foreground)]"
          >
            Series
          </Link>
        </span>
        <h1 className="em-masthead__title">{series.name}</h1>
        <div className="em-masthead__meta">
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
            <span className="rd-mono rd-dim text-base leading-none tabular-nums w-[28px]">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="truncate">
              <span className="font-[550] text-[clamp(14px,1.4vw,16px)] tracking-tight">
                {post.title}
              </span>
              {post.excerpt && (
                <>
                  <span className="rd-dim mx-1.5">—</span>
                  <span className="rd-muted text-[13px]">{post.excerpt}</span>
                </>
              )}
            </span>
            <span className="rd-muted text-[13px] shrink-0 ml-2 tabular-nums">
              {dateFormat(post.date, "MMM d, yyyy")}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
