import Link from "next/link";

import type { Post } from "@duyet/interfaces";
import { cn } from "@duyet/libs/utils";
import { Thumb } from "./Thumb";

export type Props = {
  posts: Post[];
};

export default function Feed({ posts }: Props) {
  if (!posts) {
    return <p>No blog posted yet :/</p>;
  }

  return posts.map((post) => <FeedItem key={post.slug} post={post} />);
}

export function FeedItem({ post }: { post: Post }) {
  return (
    <article key={post.slug} className="mb-32">
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
        as={`${post.slug}`}
        href="/[...slug]"
        className={cn(
          "inline-block text-4xl font-bold py-2 mt-2 hover:underline",
          "from-gray-900 to-gray-800 bg-clip-text",
          "dark:from-gray-50 dark:to-gray-300",
          "md:text-4xl md:tracking-tighter",
          "lg:text-5xl lg:tracking-tighter",
          'hover:after:content-["⥴"] hover:after:ml-2 hover:after:no-underline',
        )}
      >
        {post.title}
      </Link>

      <p className="mt-4 leading-relaxed">{post.excerpt}</p>

      <Thumb url={post.thumbnail} alt={post.title} />
    </article>
  );
}
