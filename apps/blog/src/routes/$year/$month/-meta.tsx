import Icons from "@duyet/components/Icons";
import type { Post, Series } from "@duyet/interfaces";
import { distanceToNow, formatReadingTime } from "@duyet/libs/date";
import { getSlug } from "@duyet/libs/getSlug";
import { cn } from "@duyet/libs/utils";
import { Link } from "@tanstack/react-router";
import { Calendar, Clock, Folder, Tag } from "lucide-react";

interface ContentProps {
  post: Post & { markdown_content?: string; edit_url?: string };
  series?: Series | null;
  className?: string;
}

export default function Meta({ post, className }: ContentProps) {
  return (
    <div className={cn(className)}>
      <div className="w-full flex flex-wrap items-center justify-between gap-x-5 gap-y-3 text-sm text-muted-foreground [font-variant-numeric:tabular-nums]">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          <time dateTime={new Date(post.date).toISOString()}>
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </time>
          <span className="text-border">·</span>
          <span>{distanceToNow(new Date(post.date))}</span>
        </div>

        {post.readingTime && (
          <div className="flex items-center gap-1.5" title="Reading time">
            <Clock className="h-3.5 w-3.5" />
            <span>{formatReadingTime(post.readingTime)}</span>
          </div>
        )}

        <Link
          to="/category/$category/"
          params={{ category: post.category_slug || getSlug(post.category) }}
          className="flex items-center gap-1.5 transition-colors hover:text-foreground"
        >
          <Folder className="h-3.5 w-3.5" />
          <span>{post.category}</span>
        </Link>

        {post.tags.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 shrink-0" />
            <div className="flex flex-wrap gap-1.5">
              {post.tags.slice(0, 5).map((tag) => (
                <Link
                  to="/tag/$tag/"
                  params={{ tag: getSlug(tag) }}
                  key={tag}
                  className="transition-colors hover:text-foreground"
                >
                  #{tag.toLowerCase()}
                </Link>
              ))}
              {post.tags.length > 5 && (
                <span>+{post.tags.length - 5}</span>
              )}
            </div>
          </div>
        )}

        {post.edit_url && (
          <a
            className="flex items-center gap-1.5 transition-colors hover:text-foreground"
            href={post.edit_url}
            rel="noopener noreferrer"
            target="_blank"
            title="Edit on GitHub"
          >
            <Icons.Github className="h-3.5 w-3.5" />
            <span>Edit</span>
          </a>
        )}
      </div>
    </div>
  );
}
