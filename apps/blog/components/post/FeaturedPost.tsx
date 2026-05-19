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
  const date = dateFormat(post.date, "MMMM d, yyyy");

  return (
    <Link
      to="/$year/$month/$slug/"
      params={{ year, month, slug }}
      className={cn(
        "blog-featured-post group block",
        className
      )}
    >
      <div className="blog-featured-media">
        {post.thumbnail ? (
          <img src={post.thumbnail} alt="" loading="eager" />
        ) : (
          <div className="blog-featured-fallback" aria-hidden="true">
            <span>{post.category}</span>
            <span>{date}</span>
          </div>
        )}
        <div className="blog-featured-scrim" aria-hidden="true" />
        <h2>{post.title}</h2>
      </div>

      <div className="blog-featured-copy">
        <div className="blog-featured-title" aria-hidden="true">
          {post.title}
        </div>
        <div className="blog-featured-meta">
          <span>{post.category}</span>
          <time>{date}</time>
        </div>
        {post.excerpt && <p>{post.excerpt}</p>}
      </div>
    </Link>
  );
}
