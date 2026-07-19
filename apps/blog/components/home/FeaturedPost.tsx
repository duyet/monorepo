import type { Post } from "@duyet/interfaces";
import { dateFormat } from "@duyet/libs/date";
import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

function postParams(post: Post) {
  const [, year, month, slug] = post.slug.split("/");
  return { year, month, slug };
}

function formatPostDate(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  return dateFormat(d, "MMM d, yyyy");
}

function FeaturedPost({ post }: { post: Post }) {
  const thumbnail = post.thumbnail?.trim();

  return (
    <Link
      to="/$year/$month/$slug/"
      params={postParams(post)}
      className={`overflow-hidden grid grid-cols-1 ${
        thumbnail
          ? "md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] rounded-[var(--rd-r)] bg-[var(--rd-surface)]"
          : "rd-card"
      }`}
    >
      {thumbnail && (
        <div className="overflow-hidden min-h-[200px] md:min-h-[260px] max-h-[300px] md:max-h-none flex items-center">
          <img
            src={thumbnail}
            alt={post.title}
            loading="lazy"
            className="w-full h-auto max-h-full object-contain"
          />
        </div>
      )}

      {/* Post details */}
      <div
        className="p-[clamp(26px,3vw,38px)] flex flex-col justify-center"
      >
        <div
          className="flex gap-[10px] items-center mb-4"
        >
          <span className="rd-chip font-[var(--font-mono)] text-[10.5px]">
            {post.category}
          </span>
          <span className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-xs">
            {formatPostDate(post.date)} &middot;{" "}
            {Math.max(1, Math.round(post.readingTime ?? 1))} min
          </span>
        </div>
        <h2
          className="text-[clamp(1.5rem,2.6vw,2rem)] tracking-[-0.035em] leading-[1.08]"
        >
          {post.title}
        </h2>
        {post.excerpt && (
          <p
            className="text-[var(--rd-text-2)] mt-[14px] text-[15.5px] max-w-[44ch]"
          >
            {post.excerpt}
          </p>
        )}
        <div
          className="mt-[22px] flex items-center gap-2 text-[var(--rd-accent-ink)] text-sm font-[550]"
        >
          Read the post <ArrowRight size={16} />
        </div>
      </div>
    </Link>
  );
}

export { FeaturedPost, postParams, formatPostDate };
