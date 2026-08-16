import { createFileRoute, Link } from "@tanstack/react-router";
import { StoryRow } from "../components/StoryRow";
import { formatDayHeading } from "../lib/lang";
import { useLang } from "../lib/lang-context";
import { idPrefixFromSlug } from "../lib/slug";
import { fetchStory } from "../lib/story-fn";
import type { FeedItem, Lang } from "../lib/types";

export const Route = createFileRoute("/$cat/$slug")({
  loader: async ({ params }): Promise<FeedItem | null> => {
    const idPrefix = idPrefixFromSlug(params.slug);
    if (!idPrefix) return null;
    return fetchStory({ data: { idPrefix } });
  },
  head: ({ loaderData }) => {
    const item = loaderData as FeedItem | null | undefined;
    if (!item) {
      return { meta: [{ title: "AI News" }] };
    }
    const title = `${item.title} | AI News`;
    const meta: { title?: string; property?: string; content?: string }[] = [
      { title },
      { property: "og:title", content: item.title },
    ];
    if (item.summary) {
      meta.push({ property: "og:description", content: item.summary });
    }
    if (item.image_url) {
      meta.push({ property: "og:image", content: item.image_url });
    }
    return { meta };
  },
  component: StoryPage,
});

function NotFoundStory({ lang }: { lang: Lang }) {
  return (
    <div className="py-16 text-center">
      <p className="text-muted-foreground">
        {lang === "vi" ? "Không tìm thấy tin." : "Story not found."}
      </p>
      <Link
        to="/"
        className="mt-3 inline-block text-sm text-accent underline underline-offset-2"
      >
        {lang === "vi" ? "Về trang chính" : "Back to live feed"}
      </Link>
    </div>
  );
}

function StoryContent({ item, lang }: { item: FeedItem; lang: Lang }) {
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

function StoryPage() {
  const item = Route.useLoaderData();
  const lang = useLang();

  if (!item) return <NotFoundStory lang={lang} />;
  return <StoryContent item={item} lang={lang} />;
}
