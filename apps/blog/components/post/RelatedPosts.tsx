import { Badge } from "@duyet/components";
import type { Post } from "@duyet/interfaces";
import { dateFormat } from "@duyet/libs/date";
import { cn } from "@duyet/libs/utils";

interface RelatedPostsProps {
  posts: Post[];
  className?: string;
}

export function RelatedPosts({ posts, className }: RelatedPostsProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className={cn("mt-16 border-t pt-12", className)}>
      <header className="mb-10">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          Related Posts
        </h2>
        <p className="mt-2 text-base text-muted-foreground">
          Articles you might enjoy next
        </p>
      </header>

      <ul className="divide-y">
        {posts.map((post) => {
          const url = post.slug.replace(/\.md$/, "").replace(/^\//, "");
          const readMin = post.readingTime
            ? Math.max(1, Math.round(post.readingTime))
            : null;

          return (
            <li key={post.slug}>
              <a
                href={`/${url}`}
                className="grid grid-cols-[1fr_auto] items-start gap-x-6 md:gap-x-10 py-6 group"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-base md:text-lg font-semibold tracking-tight group-hover:text-muted-foreground transition-colors">
                      {post.title}
                    </h3>
                    {post.category && (
                      <Badge variant="secondary">{post.category}</Badge>
                    )}
                  </div>
                  {post.excerpt && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end text-right shrink-0">
                  <time
                    dateTime={post.date.toISOString()}
                    className="text-sm text-muted-foreground tabular-nums whitespace-nowrap"
                  >
                    {dateFormat(post.date, "MMM d, yyyy")}
                  </time>
                  {readMin && (
                    <span className="mt-1 text-sm text-muted-foreground tabular-nums whitespace-nowrap">
                      {readMin} min read
                    </span>
                  )}
                </div>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
