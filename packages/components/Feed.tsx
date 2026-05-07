import type { Post } from "@duyet/interfaces";
import { cn } from "@duyet/libs/utils";
import { Thumb } from "./Thumb";

interface FeedItemProps {
  post: Post;
  noThumbnail?: boolean;
}

export interface FeedProps extends Omit<FeedItemProps, "post"> {
  posts: Post[];
}

export default function Feed({ posts, ...props }: FeedProps) {
  if (!posts) {
    return <p>No blog posted yet :/</p>;
  }

  return posts.map((post) => (
    <FeedItem key={post.slug} post={post} {...props} />
  ));
}

export function FeedItem({ post, noThumbnail }: FeedItemProps) {
  const [, year, month, slug] = post.slug.split("/");

  return (
    <article className="mb-16">
      <div className="mb-2 flex flex-row gap-2 text-[13px] font-medium text-[#8e8b82] dark:text-[#a09d96]">
        <time>
          {new Date(post.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </time>
        <span>·</span>
        <a
          href={`/category/${post.category_slug}`}
          className="text-[#8e8b82] hover:text-[#cc785c] dark:text-[#a09d96] dark:hover:text-[#cc785c] transition-colors"
        >
          {post.category}
        </a>
      </div>

      <a
        href={`/${post.slug}`}
        className={cn(
          "inline-block font-serif font-normal py-2 mt-2",
          "text-[#141413] dark:text-[#f8f8f2]",
          "hover:text-[#cc785c] dark:hover:text-[#cc785c]",
          "transition-colors",
          "text-3xl tracking-tight",
          "md:text-4xl md:tracking-[-0.5px]",
          "lg:text-[48px] lg:tracking-[-1px] lg:leading-[1.1]"
        )}
      >
        {post.title}
      </a>

      {post.excerpt && (
        <p className="mt-3 text-[16px] leading-[1.55] text-[#3d3d3a] dark:text-[#f8f8f2]/60">
          {post.excerpt}
        </p>
      )}

      {!noThumbnail && (
        <div className="mb-16">
          <Thumb url={post.thumbnail} alt={post.title} />
        </div>
      )}
    </article>
  );
}
