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

      <section className="em-list" aria-label="Series posts">
        {series.posts.map((post, i) => {
          const style: CSSProperties = {
            animationDelay: `${Math.min(i, 8) * 40}ms`,
          };
          return (
            <Link
              key={post.slug}
              to="/$year/$month/$slug/"
              params={postParams(post)}
              className="em-list__row editorial-enter"
              style={style}
            >
              <h3 className="em-list__title">
                <span className="mr-3 text-sm text-[color:var(--em-subtle)] tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {post.title}
              </h3>
              {post.excerpt && <p className="em-list__dek">{post.excerpt}</p>}
              <div className="em-list__meta">
                <time dateTime={new Date(post.date).toISOString()}>
                  {dateFormat(post.date, "MMM d, yyyy")}
                </time>
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
