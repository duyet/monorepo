import type { Post } from "@duyet/interfaces";
import { dateFormat } from "@duyet/libs/date";
import { cn } from "@duyet/libs/utils";
import { Link } from "@tanstack/react-router";
import type { ReactElement } from "react";

interface FeaturedPostProps {
  post: Post;
  className?: string;
}

export function FeaturedPost({
  post,
  className,
}: FeaturedPostProps): ReactElement {
  const [, year, month, slug] = post.slug.split("/");
  const date = dateFormat(post.date, "MMMM d, yyyy");

  return (
    <Link
      to="/$year/$month/$slug/"
      params={{ year, month, slug }}
      className={cn("group block text-inherit no-underline", className)}
    >
      <div className="relative aspect-video overflow-hidden rounded-[var(--rd-r)] bg-[var(--rd-surface-2)]">
        {post.thumbnail ? (
          <img
            src={post.thumbnail}
            alt=""
            width={1200}
            height={675}
            loading="eager"
            className="block h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.015]"
          />
        ) : (
          <div
            className="flex h-full flex-col justify-between p-7 font-[family-name:var(--font-mono)] text-[12px] tracking-[0.06em] text-[var(--rd-text-3)] uppercase bg-[linear-gradient(90deg,var(--rd-border)_1px,transparent_1px),linear-gradient(var(--rd-border)_1px,transparent_1px),var(--rd-surface-2)] bg-size-[34px_34px]"
            aria-hidden="true"
          >
            <span>{post.category}</span>
            <span>{date}</span>
          </div>
        )}
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,rgb(0_0_0/0.46)_63%,rgb(0_0_0/0.82)_100%)]"
          aria-hidden="true"
        />
        <h1 className="absolute right-8 bottom-7 left-8 m-0 max-w-[53rem] font-[family-name:var(--font-display)] text-[clamp(1.75rem,4.2vw,3.4rem)] font-normal leading-[1.05] tracking-[-0.03em] text-white">
          {post.title}
        </h1>
      </div>

      <div className="grid gap-8 pt-7 min-[720px]:grid-cols-[0.9fr_1fr]">
        <div
          className="m-0 font-[family-name:var(--font-display)] text-[clamp(1.5rem,2.6vw,2.35rem)] font-normal leading-[1.1] tracking-[-0.03em] text-[var(--rd-text)]"
          aria-hidden="true"
        >
          {post.title}
        </div>
        <div>
          <div className="flex flex-wrap items-baseline gap-2 text-[0.875rem] font-medium text-[var(--rd-text-3)]">
            <span className="text-[var(--rd-text)]">{post.category}</span>
            <time>{date}</time>
          </div>
          {post.excerpt ? (
            <p className="mt-2.5 m-0 text-[1rem] leading-[1.5] text-[var(--rd-text-2)]">
              {post.excerpt}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
