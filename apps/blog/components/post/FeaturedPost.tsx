import type { Post } from "@duyet/interfaces";
import { dateFormat } from "@duyet/libs/date";
import { cn } from "@duyet/libs/utils";
import { Link } from "@tanstack/react-router";

interface FeaturedPostProps {
  post: Post;
  className?: string;
}

const FEATURED_GRADIENT =
  "from-[#1a1a1a] via-[#2a2a2a] to-[#3a3a3a] dark:from-[#f8f8f2]/10 dark:via-[#f8f8f2]/5 dark:to-transparent";

export function FeaturedPost({ post, className }: FeaturedPostProps) {
  const [, year, month, slug] = post.slug.split("/");

  return (
    <Link
      to="/$year/$month/$slug/"
      params={{ year, month, slug }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl",
        "border border-[#1a1a1a]/8 dark:border-white/8",
        "bg-gradient-to-br",
        FEATURED_GRADIENT,
        "transition-all duration-200",
        "hover:shadow-xl hover:shadow-[#1a1a1a]/10 dark:hover:shadow-black/30",
        className
      )}
    >
      {/* Dark overlay with content */}
      <div className="flex flex-col justify-end p-8 sm:p-10 lg:p-12">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50 dark:text-[#f8f8f2]/50">
          {post.category}
        </span>
        <h2
          className={cn(
            "mt-3 text-3xl font-semibold leading-[1.1] tracking-tight",
            "text-white dark:text-[#f8f8f2]",
            "sm:text-4xl"
          )}
        >
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/65 dark:text-[#f8f8f2]/65 line-clamp-3">
            {post.excerpt}
          </p>
        )}
        <div className="mt-6 flex items-center gap-3 text-sm font-medium text-white/50 dark:text-[#f8f8f2]/50">
          <time>{dateFormat(post.date, "MMMM d, yyyy")}</time>
          {post.readingTime && (
            <>
              <span>·</span>
              <span>{post.readingTime} min read</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
