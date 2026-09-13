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
      className={
        thumbnail
          ? "group grid overflow-hidden rounded-[var(--rd-r-lg)] bg-[var(--rd-surface)] text-inherit no-underline shadow-[var(--rd-shadow)] max-md:grid-cols-1 md:grid-cols-[1.15fr_minmax(0,1fr)]"
          : "group grid overflow-hidden rounded-[var(--rd-r-lg)] border border-[var(--rd-border)] bg-[var(--rd-surface)] text-inherit no-underline"
      }
    >
      {thumbnail ? (
        <div className="relative min-h-[220px] overflow-hidden bg-[var(--rd-surface-2)] md:min-h-[320px]">
          <img
            src={thumbnail}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>
      ) : null}

      <div className="flex flex-col justify-center px-[clamp(1.5rem,3vw,2.5rem)] py-[clamp(1.6rem,3vw,2.4rem)]">
        <div className="mb-4 flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center rounded-full border border-[var(--rd-border)] bg-[var(--rd-bg)] px-2.5 py-1 font-[family-name:var(--font-mono)] text-[10.5px] font-medium tracking-[0.04em] text-[var(--rd-text-2)] uppercase">
            {post.category}
          </span>
          <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--rd-text-3)]">
            {formatPostDate(post.date)} ·{" "}
            {Math.max(1, Math.round(post.readingTime ?? 1))} min
          </span>
        </div>
        <h2 className="m-0 font-[family-name:var(--font-display)] text-[clamp(1.7rem,2.8vw,2.25rem)] font-normal leading-[1.08] tracking-[-0.035em] text-[var(--rd-text)]">
          {post.title}
        </h2>
        {post.excerpt ? (
          <p className="mt-3.5 m-0 max-w-[44ch] text-[15.5px] leading-[1.55] text-[var(--rd-text-2)]">
            {post.excerpt}
          </p>
        ) : null}
        <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--rd-accent-ink)]">
          Read the post <ArrowRight size={16} aria-hidden />
        </div>
      </div>
    </Link>
  );
}

export { FeaturedPost, postParams, formatPostDate };
