import type { Post } from "@duyet/interfaces";
import { dateFormat } from "@duyet/libs/date";
import { cn } from "@duyet/libs/utils";
import { Link } from "@tanstack/react-router";

interface PostCardProps {
  post: Post;
  className?: string;
}

function categoryGradient(category: string): string {
  const palettes = [
    "from-[#f3eee6] to-[#e8dfd4] dark:from-[#2a2520] dark:to-[#1f1b17]",
    "from-[#dbeafe] to-[#c7d9f0] dark:from-[#1a2744] dark:to-[#151e33]",
    "from-[#d1fae5] to-[#bfe9d5] dark:from-[#14332a] dark:to-[#0f2620]",
    "from-[#fef3c7] to-[#f0e4ad] dark:from-[#332e1a] dark:to-[#28240f]",
    "from-[#ede9fe] to-[#ddd6fe] dark:from-[#231f3a] dark:to-[#1a1730]",
    "from-[#fce7f3] to-[#f3d0e0] dark:from-[#331a28] dark:to-[#281420]",
    "from-[#fed7aa] to-[#f0c696] dark:from-[#332714] dark:to-[#281e0f]",
    "from-[#c7d2fe] to-[#b5c1f0] dark:from-[#1f2040] dark:to-[#171833]",
  ];
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = (hash * 31 + category.charCodeAt(i)) | 0;
  }
  return palettes[Math.abs(hash) % palettes.length];
}

export function PostCard({ post, className }: PostCardProps) {
  const [, year, month, slug] = post.slug.split("/");

  return (
    <Link
      to="/$year/$month/$slug/"
      params={{ year, month, slug }}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl",
        "border border-[#1a1a1a]/8 dark:border-white/8",
        "bg-white dark:bg-[#141413]",
        "transition-all duration-200",
        "hover:shadow-lg hover:shadow-[#1a1a1a]/5 dark:hover:shadow-black/20",
        "hover:-translate-y-0.5",
        className
      )}
    >
      {/* Gradient header */}
      <div
        className={cn(
          "h-40 bg-gradient-to-br",
          categoryGradient(post.category)
        )}
      />

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <span className="text-xs font-medium uppercase tracking-[0.12em] text-[#1a1a1a]/50 dark:text-[#f8f8f2]/50">
          {post.category}
        </span>
        <h3
          className={cn(
            "mt-2 text-lg font-semibold leading-snug tracking-tight",
            "text-[#1a1a1a] dark:text-[#f8f8f2]",
            "line-clamp-2"
          )}
        >
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-2 text-sm leading-relaxed text-[#1a1a1a]/60 dark:text-[#f8f8f2]/60 line-clamp-2">
            {post.excerpt}
          </p>
        )}
        <div className="mt-auto flex items-center gap-2 pt-4 text-xs font-medium text-[#1a1a1a]/45 dark:text-[#f8f8f2]/45">
          <time>
            {dateFormat(post.date, "MMM d, yyyy")}
          </time>
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
