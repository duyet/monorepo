import type { Post } from "@duyet/interfaces";
import { cn } from "@duyet/libs/utils";
import { distanceToNow } from "@duyet/libs/date";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface RelatedPostsProps {
  posts: Post[];
  className?: string;
}

export function RelatedPosts({ posts, className }: RelatedPostsProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <div className={cn("mt-16", className)}>
      <h2 className={cn(
        "flex items-center gap-2",
        "text-xl font-bold",
        "text-gray-900 dark:text-gray-100",
        "mb-6"
      )}>
        Related Posts
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        {posts.map((post) => {
          const url = post.slug.replace(/\.md$/, "").replace(/^\//, "");
          const excerpt = post.excerpt || "";

          return (
            <Link
              key={post.slug}
              href={`/${url}`}
              className={cn(
                "group block",
                "p-4 rounded-xl",
                "border border-gray-200 dark:border-gray-800",
                "hover:border-gray-300 dark:hover:border-gray-700",
                "hover:bg-gray-50 dark:hover:bg-gray-900/50",
                "transition-all duration-200"
              )}
            >
              <article>
                <h3 className={cn(
                  "font-semibold text-base",
                  "text-gray-900 dark:text-gray-100",
                  "group-hover:text-blue-600 dark:group-hover:text-blue-400",
                  "transition-colors duration-200",
                  "line-clamp-2 mb-2"
                )}>
                  {post.title}
                </h3>

                {excerpt && (
                  <p className={cn(
                    "text-sm text-gray-600 dark:text-gray-400",
                    "line-clamp-2 mb-3"
                  )}>
                    {excerpt}
                  </p>
                )}

                <div className={cn(
                  "flex items-center gap-2",
                  "text-xs text-gray-500 dark:text-gray-500"
                )}>
                  <time dateTime={post.date.toISOString()}>
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                  <span>·</span>
                  <span>{distanceToNow(post.date)}</span>
                </div>

                <div className={cn(
                  "flex items-center gap-1 mt-3",
                  "text-sm font-medium",
                  "text-blue-600 dark:text-blue-400",
                  "opacity-0 group-hover:opacity-100",
                  "transition-opacity duration-200"
                )}>
                  Read more
                  <ArrowRight className="h-4 w-4" />
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
