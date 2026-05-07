import type { Post } from "@duyet/interfaces";
import { dateFormat } from "@duyet/libs/date";
import { cn } from "@duyet/libs/utils";
import { Link } from "@tanstack/react-router";

interface PostCardProps {
  post: Post;
  className?: string;
}

export function PostCard({ post, className }: PostCardProps) {
  const [, year, month, slug] = post.slug.split("/");

  return (
    <Link
      to="/$year/$month/$slug/"
      params={{ year, month, slug }}
      className={cn(
        "group block rounded-xl p-6",
        "bg-[var(--muted)] dark:bg-white/5",
        "transition-colors",
        "hover:bg-[var(--muted)]/80 dark:hover:bg-white/8",
        className
      )}
    >
      <div className="flex items-center gap-2 text-[13px] font-medium text-[var(--muted-foreground)]">
        <span>{post.category}</span>
        <span>·</span>
        <time>{dateFormat(post.date, "MMM d, yyyy")}</time>
      </div>
      <h3
        className={cn(
          "mt-2 text-[18px] font-medium leading-[1.3] tracking-tight",
          "text-[var(--foreground)]",
          "font-serif",
          "group-hover:text-[var(--accent)]",
          "transition-colors"
        )}
      >
        {post.title}
      </h3>
      {post.excerpt && (
        <p className="mt-2 line-clamp-2 text-[14px] leading-[1.55] text-[#3d3d3a] dark:text-[var(--foreground)]/60">
          {post.excerpt}
        </p>
      )}
    </Link>
  );
}
