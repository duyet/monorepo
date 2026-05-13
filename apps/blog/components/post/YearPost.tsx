import type { Post } from "@duyet/interfaces";
import { dateFormat } from "@duyet/libs/date";
import { cn } from "@duyet/libs/utils";
import { Link } from "@tanstack/react-router";

export interface YearPostProps {
  year: number;
  posts: Post[];
  className?: string;
}

export function YearPost({ year, posts, className }: YearPostProps) {
  if (!posts.length) return null;

  return (
    <div className={cn(className)}>
      <h2 className="mb-4 text-[26px] font-semibold tracking-[-0.02em] text-[var(--foreground)]">
        {year}
      </h2>

      <div className="divide-y divide-[var(--border-faint)] border-y border-[var(--border-faint)]">
        {posts.map((post: Post) => {
          const [, year, month, slug] = post.slug.split("/");
          return (
            <Link
              className="group flex flex-col gap-1 py-4 transition-colors hover:bg-[var(--surface-soft)] sm:flex-row sm:items-center sm:gap-4 sm:px-3"
              to="/$year/$month/$slug/"
              params={{ year, month, slug }}
              key={post.slug}
            >
              <div className="min-w-0 flex-1 break-words text-[15px] font-medium leading-[1.45] text-[var(--foreground)] transition-colors group-hover:text-[var(--body)]">
                {post.title}
              </div>
              <time className="flex-shrink-0 whitespace-nowrap text-[12px] font-medium text-[var(--muted-foreground)]">
                {dateFormat(post.date, "MMM dd")}
              </time>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
