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
        "bg-[#efe9de] dark:bg-white/5",
        "transition-colors",
        "hover:bg-[#e8e0d2] dark:hover:bg-white/8",
        className
      )}
    >
      <div className="flex items-center gap-2 text-[13px] font-medium text-[#6c6a64] dark:text-[#f8f8f2]/45">
        <span>{post.category}</span>
        <span>·</span>
        <time>{dateFormat(post.date, "MMM d, yyyy")}</time>
      </div>
      <h3
        className={cn(
          "mt-2 text-[18px] font-medium leading-[1.3] tracking-tight",
          "text-[#141413] dark:text-[#f8f8f2]",
          "font-serif",
          "group-hover:text-[#cc785c] dark:group-hover:text-[#cc785c]",
          "transition-colors"
        )}
      >
        {post.title}
      </h3>
      {post.excerpt && (
        <p className="mt-2 line-clamp-2 text-[14px] leading-[1.55] text-[#3d3d3a] dark:text-[#f8f8f2]/60">
          {post.excerpt}
        </p>
      )}
    </Link>
  );
}
