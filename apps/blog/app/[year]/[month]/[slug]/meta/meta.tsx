import Link from "next/link";

import Icons from "@duyet/components/Icons";
import type { Post } from "@duyet/interfaces";
import { distanceToNow } from "@duyet/libs/date";
import { getSeries } from "@duyet/libs/getSeries";
import { getSlug } from "@duyet/libs/getSlug";
import { cn } from "@duyet/libs/utils";
import { SeriesBox } from "../../../../../components/series";
import { MarkdownMenuWrapper } from "./markdown-menu-wrapper";

interface ContentProps {
  post: Post & { markdown_content?: string };
  className?: string;
}

export default function Content({ post, className }: ContentProps) {
  const markdownUrl = post.slug.replace(/\.html$/, ".md");

  return (
    <div>
      <div
        className={cn(
          "flex flex-col gap-4",
          "border-l-2 border-gray-300 dark:border-slate-700 pl-4 py-3",
          className
        )}
      >
        {/* Date and Category */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <time className="font-medium text-gray-700 dark:text-gray-300">
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </time>
          <time className="text-gray-600 dark:text-gray-400">
            ({distanceToNow(new Date(post.date))})
          </time>
          <span className="text-gray-400 dark:text-gray-500">•</span>
          <Link
            href={`/category/${post.category_slug}`}
            className="font-medium text-gray-700 dark:text-gray-300 transition-colors hover:text-gray-900 dark:hover:text-white hover:underline"
          >
            {post.category}
          </Link>
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-row flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link
                href={`/tag/${getSlug(tag)}`}
                key={tag}
                title={`Tag: ${tag}`}
                className="text-xs font-medium px-2 py-1 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-100 dark:hover:bg-slate-900/50"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
          <a
            className="transition-colors hover:text-gray-900 dark:hover:text-white"
            href={post.edit_url}
            rel="noopener noreferrer"
            target="_blank"
            title="Edit in Github"
          >
            <Icons.Github className="h-4 w-4" />
          </a>
          {post.markdown_content && (
            <>
              <span className="text-gray-400 dark:text-gray-600">•</span>
              <MarkdownMenuWrapper
                markdownUrl={markdownUrl}
                markdownContent={post.markdown_content}
              />
            </>
          )}
        </div>
      </div>

      {Boolean(post.series) && (
        <SeriesBox
          className="mt-8"
          current={post.slug}
          series={getSeries({ name: post.series })}
        />
      )}
    </div>
  );
}
