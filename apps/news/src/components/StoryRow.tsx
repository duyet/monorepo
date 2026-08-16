import { TrendingUp } from "lucide-react";
import { timeAgo } from "../lib/lang";
import type { FeedItem, Lang } from "../lib/types";

export function StoryRow({
  item,
  index,
  lang,
  hot,
}: {
  item: FeedItem;
  index: number;
  lang: Lang;
  hot?: boolean;
}) {
  const title = lang === "vi" && item.title_vi ? item.title_vi : item.title;

  return (
    <div
      id={`item-${item.id}`}
      className="flex items-baseline gap-3 border-b border-border py-3"
    >
      <span className="w-6 shrink-0 text-right text-sm text-muted-foreground">
        {index}
      </span>
      {hot && (
        <TrendingUp
          className="h-4 w-4 shrink-0 self-center text-accent"
          aria-hidden
        />
      )}
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="min-w-0 flex-1 font-semibold leading-snug hover:text-accent"
      >
        {title}
      </a>
      <span className="hidden shrink-0 text-sm text-muted-foreground sm:block">
        {item.category}
      </span>
      <span className="hidden w-20 shrink-0 text-right text-sm text-muted-foreground md:block">
        {timeAgo(item.published_at)}
      </span>
      <span className="w-14 shrink-0 text-right text-sm font-bold tabular-nums">
        {item.points}/{item.comments}
      </span>
    </div>
  );
}
