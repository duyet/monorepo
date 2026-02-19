import type { Post } from "@duyet/interfaces";
import { cn } from "@duyet/libs/utils";
import Link from "next/link";
import { Thumb } from "./Thumb";

/**
 * Props for individual feed items
 */
interface FeedItemProps {
  /** Post data to display */
  post: Post;
  /** Hide thumbnail image if true */
  noThumbnail?: boolean;
}

/**
 * Props for the Feed component
 */
export interface FeedProps extends Omit<FeedItemProps, "post"> {
  /** Array of posts to display */
  posts: Post[];
}

/**
 * Feed component - displays posts in a vertical list layout
 *
 * Features large typography, category links, and optional thumbnails.
 * Suitable for blog index pages and archives.
 *
 * @example
 * ```tsx
 * import { Feed } from '@duyet/components'
 *
 * <Feed posts={posts} />
 * <Feed posts={posts} noThumbnail />
 * ```
 */
export default function Feed({ posts, ...props }: FeedProps) {
  if (!posts) {
    return <p>No blog posted yet :/</p>;
  }

  return posts.map((post) => (
    <FeedItem key={post.slug} post={post} {...props} />
  ));
}

/**
 * FeedItem component - individual item within the feed
 * @internal
 */
export function FeedItem({ post, noThumbnail }: FeedItemProps) {
  return (
    <article key={post.slug} className="mb-16">
      <div className="flex flex-row gap-2 mb-2 text-gray-400">
        <time>{post.date.toString()}</time>

        <Link
          href={`/category/${post.category_slug}`}
          className="text-gray-400"
        >
          {post.category}
        </Link>
      </div>

      <Link
        href={`/${post.slug}`}
        className={cn(
          "inline-block text-4xl font-bold py-2 mt-2 hover:underline",
          "from-gray-900 to-gray-800 bg-clip-text",
          "dark:from-gray-50 dark:to-gray-300",
          "md:text-4xl md:tracking-tighter",
          "lg:text-5xl lg:tracking-tighter"
        )}
      >
        {post.title}
      </Link>

      <p className="mt-4 leading-relaxed">{post.excerpt}</p>

      {!noThumbnail && (
        <div className="mb-16">
          <Thumb url={post.thumbnail} alt={post.title} />
        </div>
      )}
    </article>
  );
}
