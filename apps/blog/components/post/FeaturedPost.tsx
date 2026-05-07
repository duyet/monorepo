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
        "group block rounded-xl p-8",
        // Always dark surface — cream-to-dark pacing rhythm
        "bg-[#181715]",
        className
      )}
    >
      <span className="inline-block rounded-full bg-[var(--accent)] px-3 py-1 text-[12px] font-medium uppercase tracking-[1.5px] text-white">
        {post.category}
      </span>
      <h2
        className={cn(
          "mt-4 text-[36px] font-normal leading-[1.15] tracking-[-0.5px]",
          "text-[#faf9f5]",
          "font-serif",
          "group-hover:text-[#faf9f5]/80",
          "transition-colors"
        )}
      >
        {post.title}
      </h2>
      {post.excerpt && (
        <p className="mt-3 line-clamp-3 text-[16px] leading-[1.55] text-[#a09d96]">
          {post.excerpt}
        </p>
      )}
      <div className="mt-5 flex items-center gap-2 text-[14px] text-[#a09d96]">
        <time>{dateFormat(post.date, "MMMM d, yyyy")}</time>
        {post.readingTime && (
          <>
            <span>·</span>
            <span>{post.readingTime} min read</span>
          </>
        )}
      </div>
    </Link>
  );
}
