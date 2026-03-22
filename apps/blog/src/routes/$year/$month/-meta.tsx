import Icons from "@duyet/components/Icons";
import type { Post, Series } from "@duyet/interfaces";
import { distanceToNow, formatReadingTime } from "@duyet/libs/date";
import { getSlug } from "@duyet/libs/getSlug";
import { cn } from "@duyet/libs/utils";
import { Calendar, Clock, Folder, Tag } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { SeriesBox } from "@/components/layout";
import { MarkdownMenuWrapper } from "./-markdown-menu-wrapper";

interface ContentProps {
  post: Post & { markdown_content?: string; edit_url?: string };
  series?: Series | null;
  className?: string;
}

export default function Meta({ post, series, className }: ContentProps) {
  const markdownUrl = post.slug.replace(/\.html$/, ".md");

  return (
    <div className={cn("space-y-8", className)}>
      {/* Compact Metadata Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3">
        {/* Date */}
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          <time dateTime={new Date(post.date).toISOString()}>
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </time>
          <span className="text-gray-400 dark:text-gray-600">·</span>
          <span>{distanceToNow(new Date(post.date))}</span>
        </div>

        {post.readingTime && (
          <>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <div className="flex items-center gap-1.5" title="Reading time">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatReadingTime(post.readingTime)}</span>
            </div>
          </>
        )}

        <span className="text-gray-300 dark:text-gray-700">|</span>

        {/* Category */}
        <Link
          to="/category/$category"
          params={{ category: post.category_slug || getSlug(post.category) }}
          className="flex items-center gap-1.5 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <Folder className="h-3.5 w-3.5" />
          <span>{post.category}</span>
        </Link>

        {/* Tags */}
        {post.tags.length > 0 && (
          <>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <div className="flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 shrink-0" />
              <div className="flex flex-wrap gap-1.5">
                {post.tags.slice(0, 5).map((tag) => (
                  <Link
                    to="/tag/$tag"
                    params={{ tag: getSlug(tag) }}
                    key={tag}
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
                {post.tags.length > 5 && (
                  <span className="text-gray-400">+{post.tags.length - 5}</span>
                )}
              </div>
            </div>
          </>
        )}

        <span className="text-gray-300 dark:text-gray-700">|</span>

        {/* Actions */}
        <a
          className="flex items-center gap-1.5 hover:text-gray-900 dark:hover:text-white transition-colors"
          href={post.edit_url || "#"}
          rel="noopener noreferrer"
          target="_blank"
          title="Edit on GitHub"
        >
          <Icons.Github className="h-3.5 w-3.5" />
          <span>Edit</span>
        </a>

        {post.markdown_content && (
          <>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <MarkdownMenuWrapper
              markdownUrl={markdownUrl}
              markdownContent={post.markdown_content}
            />
          </>
        )}
      </div>

      {/* Series Box */}
      {Boolean(post.series) && series && (
        <SeriesBox current={post.slug} series={series} />
      )}
    </div>
  );
}
