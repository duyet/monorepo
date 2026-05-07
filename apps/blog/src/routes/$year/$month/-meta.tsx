import Icons from "@duyet/components/Icons";
import type { Post, Series } from "@duyet/interfaces";
import { distanceToNow, formatReadingTime } from "@duyet/libs/date";
import { getSlug } from "@duyet/libs/getSlug";
import { cn } from "@duyet/libs/utils";
import { Calendar, Clock, Folder, Tag } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { MarkdownMenuWrapper } from "./-markdown-menu-wrapper";

interface ContentProps {
  post: Post & { markdown_content?: string; edit_url?: string };
  series?: Series | null;
  className?: string;
}

export default function Meta({ post, className }: ContentProps) {
  const markdownUrl = `${post.slug.replace(/\.html$/, "")}.md`;

  return (
    <div className={cn(className)}>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm font-medium text-[#1a1a1a]/55 dark:text-[#f8f8f2]/55">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          <time dateTime={new Date(post.date).toISOString()}>
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </time>
          <span className="text-[#1a1a1a]/20 dark:text-white/20">·</span>
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
          className="flex items-center gap-1.5 transition-colors hover:text-[#1a1a1a] dark:hover:text-[#f8f8f2]"
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
                  className="transition-colors hover:text-[#1a1a1a] dark:hover:text-[#f8f8f2]"
                >
                  #{tag.toLowerCase()}
                </Link>
              ))}
              {post.tags.length > 5 && (
                <span className="text-[#1a1a1a]/35 dark:text-white/35">
                  +{post.tags.length - 5}
                </span>
              )}
            </div>
          </div>
        )}

        <a
          className="flex items-center gap-1.5 transition-colors hover:text-[#1a1a1a] dark:hover:text-[#f8f8f2]"
          href={post.edit_url || "#"}
          rel="noopener noreferrer"
          target="_blank"
          title="Edit on GitHub"
        >
          <Icons.Github className="h-3.5 w-3.5" />
          <span>Edit</span>
        </a>

        {post.markdown_content && (
          <MarkdownMenuWrapper
            markdownUrl={markdownUrl}
            markdownContent={post.markdown_content}
          />
        )}
      </div>
    </div>
  );
}
