import { MessageCircle } from "lucide-react";

/**
 * Total comments across a post's discussion threads, shown beside the
 * category and token pills.
 *
 * Renders nothing while the total is unknown or zero, so a post nobody
 * replied to keeps exactly the row it had before.
 */
function CommentCount({ count }: { count?: number }) {
  if (!count) return null;

  return (
    <span
      title={`${count} ${count === 1 ? "comment" : "comments"}`}
      className="flex items-center gap-1 font-[var(--font-mono)] text-[var(--rd-text-3)] text-[11px] tabular-nums shrink-0"
    >
      <MessageCircle size={11} aria-hidden="true" className="shrink-0" />
      {count}
    </span>
  );
}

export { CommentCount };
