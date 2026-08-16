import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { StoryRow } from "../components/StoryRow";
import { formatDayHeading } from "../lib/lang";
import { useLang } from "../lib/lang-context";
import { idPrefixFromSlug } from "../lib/slug";
import { getStory } from "../lib/story-queries";
import type { FeedItem } from "../lib/types";

export const Route = createFileRoute("/$cat/$slug")({
  loader: async ({ params }): Promise<FeedItem> => {
    const idPrefix = idPrefixFromSlug(params.slug);
    if (!idPrefix) throw notFound();
    const { env } = await import("cloudflare:workers");
    const db = (env as { DB?: D1Database }).DB;
    if (!db) throw new Error("D1 binding DB not configured");
    const item = await getStory(db, idPrefix);
    if (!item) throw notFound();
    return item;
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [{ title: `${loaderData.title} | AI News` }] : [],
  }),
  component: StoryPage,
});

function StoryPage() {
  const item = Route.useLoaderData();
  const lang = useLang();
  const date = new Date(item.published_at * 1000).toISOString().slice(0, 10);

  return (
    <div>
      <div className="flex items-center justify-between py-4 text-sm">
        <Link to="/" className="text-muted-foreground hover:text-accent">
          ← {lang === "vi" ? "Về trang chính" : "Back to live feed"}
        </Link>
        <span className="text-muted-foreground">
          1 {lang === "vi" ? "tin" : "story"}
        </span>
      </div>
      <div className="border-b-2 border-foreground/80 pb-2">
        <h2 className="text-xl font-bold">{formatDayHeading(date, lang)}</h2>
      </div>
      <StoryRow item={item} index={1} lang={lang} defaultExpanded />
    </div>
  );
}
