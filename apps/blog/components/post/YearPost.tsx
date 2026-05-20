import type { Post } from "@duyet/interfaces";
import { dateFormat } from "@duyet/libs/date";
import { cn } from "@duyet/libs/utils";
import { Link } from "@tanstack/react-router";
import type { ReactElement } from "react";

export interface YearPostProps {
  year: number;
  posts: Post[];
  className?: string;
}

export function YearPost({
  year,
  posts,
  className,
}: YearPostProps): ReactElement | null {
  if (!posts.length) return null;

  return (
    <div className={cn("year-post-group", className)}>
      <h2>{year}</h2>

      <div className="year-post-list">
        {posts.map((post: Post) => {
          const [, year, month, slug] = post.slug.split("/");
          return (
            <Link
              className="year-post-row group"
              to="/$year/$month/$slug/"
              params={{ year, month, slug }}
              key={post.slug}
            >
              <div className="year-post-title">
                {post.title}
              </div>
              <time>
                {dateFormat(post.date, "MMM dd")}
              </time>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
