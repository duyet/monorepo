import { createFileRoute, Link } from "@tanstack/react-router";
import { CategoryNav } from "../components/CategoryNav";
import { DaySection } from "../components/DaySection";
import { fetchFeed } from "../lib/feed-fn";
import { useLang } from "../lib/lang-context";
import type { FeedResponse } from "../lib/types";

export const Route = createFileRoute("/category/$slug")({
  loader: async ({ params }): Promise<FeedResponse> =>
    fetchFeed({ data: { category: params.slug } }),
  component: CategoryPage,
});

function CategoryPage() {
  const feed = Route.useLoaderData();
  const { slug } = Route.useParams();
  const lang = useLang();

  return (
    <div>
      <CategoryNav categories={feed.categories} active={slug} />
      <p className="py-3 text-sm text-muted-foreground">
        <Link to="/" className="underline underline-offset-2">
          {lang === "vi" ? "Tất cả" : "All stories"}
        </Link>{" "}
        /{" "}
        <span className="font-semibold capitalize text-foreground">{slug}</span>{" "}
        — {feed.totalStories}
      </p>
      {feed.days.map((day) => (
        <DaySection key={day.date} day={day} lang={lang} />
      ))}
      {feed.days.length === 0 && (
        <p className="py-16 text-center text-muted-foreground">
          {lang === "vi" ? "Chưa có tin nào." : "No stories yet."}
        </p>
      )}
    </div>
  );
}
