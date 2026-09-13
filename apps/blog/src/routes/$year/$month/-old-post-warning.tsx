import type { Post } from "@duyet/interfaces";
import { cn } from "@duyet/libs/utils";

export function OldPostWarning({
  post,
  year,
  className,
}: {
  post: Post;
  year: number;
  className?: string;
}) {
  const publishDate = new Date(post.date);
  const currentDate = new Date();

  const diff = currentDate.getTime() - publishDate.getTime();
  const postYear = Math.ceil(diff / (1000 * 60 * 60 * 24 * 365.25));

  if (postYear < year) {
    return null;
  }

  return (
    <aside
      role="note"
      className={cn(
        "mx-auto mb-8 box-border w-full max-w-[68ch] rounded-md bg-muted px-4 py-3 text-sm leading-relaxed text-muted-foreground",
        className,
      )}
    >
      This post is over {postYear} years old. The information may be outdated.
    </aside>
  );
}
