import Link from "next/link";
import Image from "next/image";

import type { Post } from "@duyet/interfaces";
import { cn } from "@duyet/libs/utils";

export type Props = {
  posts: Post[];
};

const Thumb = ({ url, alt }: { url?: string; alt?: string }) => {
  if (!url) return null;

  if (url.startsWith("http://")) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} className="mt-4" alt={alt} />;
  }

  return (
    <Image
      src={url}
      className="mt-4"
      width={800}
      height={300}
      alt={alt || ""}
    />
  );
};

export function FeedItem({ post }: { post: Post }) {
  return (
    <article key={post.slug} className="mb-32">
      <div className="flex flex-row gap-2 mb-2 text-gray-400">
        <time>{post.date.toString()}</time>

        <Link
          href={`/category/${post.category_slug}`}
          className="text-gray-400"
        >
          in {post.category}
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
        )}
      >
        {post.title}
      </Link>

      <p className="mt-4 leading-relaxed">{post.excerpt}</p>

      <Thumb url={post.thumbnail} alt={post.title} />
    </article>
  );
}

export default function Feed({ posts }: Props) {
  return posts.length ? (
    posts.map((post) => <FeedItem key={post.slug} post={post} />)
  ) : (
    <p>No blog posted yet :/</p>
  );
}
