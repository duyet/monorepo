import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { StoryRow } from "../components/StoryRow";
import { formatDayHeading } from "../lib/lang";
import { useLang } from "../lib/lang-context";
import { idPrefixFromSlug } from "../lib/slug";
import type { FeedItem, Lang } from "../lib/types";

export const Route = createFileRoute("/$cat/$slug")({
  head: () => ({
    meta: [{ title: "AI News" }],
  }),
  component: StoryPage,
});

function StorySkeleton() {
  return (
    <div className="animate-pulse space-y-3 py-6">
      <div className="h-6 w-2/3 rounded bg-muted" />
      <div className="h-4 w-full rounded bg-muted" />
      <div className="h-4 w-5/6 rounded bg-muted" />
    </div>
  );
}

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
  const title = lang === "vi" && item.title_vi ? item.title_vi : item.title;

  useEffect(() => {
    document.title = `${title} | AI News`;
  }, [title]);

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
  const { slug } = Route.useParams();
  const lang = useLang();
  const [item, setItem] = useState<FeedItem | null | undefined>(undefined);

  // Static shell — the story is bound client-side from /api/story/:id.
  useEffect(() => {
    const idPrefix = idPrefixFromSlug(slug);
    if (!idPrefix) {
      setItem(null);
      return;
    }
    let cancelled = false;
    setItem(undefined);
    fetch(`/api/story/${encodeURIComponent(idPrefix)}`)
      .then((res) => (res.ok ? (res.json() as Promise<FeedItem>) : null))
      .then((res) => {
        if (!cancelled) setItem(res);
      })
      .catch(() => {
        if (!cancelled) setItem(null);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (item === undefined) return <StorySkeleton />;
  if (item === null) return <NotFoundStory lang={lang} />;
  return <StoryContent item={item} lang={lang} />;
}
