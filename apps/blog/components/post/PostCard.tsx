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
      className={cn("card", className)}
    >
      <div className="card-body">
        <div className="post-meta">
          <span>{post.category}</span>
          <span>·</span>
          <time>{dateFormat(post.date, "MMM d, yyyy")}</time>
        </div>
        <h3 className="card-title mt-3">{post.title}</h3>
        {post.excerpt && <p className="card-desc mt-2">{post.excerpt}</p>}
        <div className="card-footer">
          <span>{post.readingTime || "Article"}</span>
          <span className="card-arrow">→</span>
        </div>
      </div>
    </Link>
  );
}
