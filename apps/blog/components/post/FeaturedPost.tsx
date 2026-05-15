import type { Post } from "@duyet/interfaces";
import { dateFormat } from "@duyet/libs/date";
import { cn } from "@duyet/libs/utils";
import { Link } from "@tanstack/react-router";

interface FeaturedPostProps {
  post: Post;
  className?: string;
}

export function FeaturedPost({ post, className }: FeaturedPostProps) {
  const [, year, month, slug] = post.slug.split("/");

  return (
    <Link
      to="/$year/$month/$slug/"
      params={{ year, month, slug }}
      className={cn(
        "group block border-y border-[var(--border-faint)] py-7 transition-colors hover:bg-[var(--surface-soft)] sm:py-8",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-2 text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--muted)]">
        <span>{post.category}</span>
        <span>/</span>
        <time>{dateFormat(post.date, "MMMM d, yyyy")}</time>
      </div>
      <h2
        className={cn(
          "mt-4 max-w-4xl text-[30px] font-semibold leading-[1.12] tracking-[-0.02em] sm:text-[38px]",
          "text-[var(--ink)]",
          "group-hover:text-[var(--body)]",
          "transition-colors"
        )}
      >
        {post.title}
      </h2>
      {post.excerpt && (
        <p className="mt-4 max-w-3xl text-[15px] leading-[1.65] text-[var(--body)]">
          {post.excerpt}
        </p>
      )}
      <div className="mt-5 flex items-center gap-2 text-[13px] text-[var(--muted)]">
        {post.readingTime && (
          <span>{post.readingTime} min read</span>
        )}
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </div>
    </Link>
  );
}
