import type { Post } from "@duyet/interfaces";
import Link from "next/link";
import { Thumb } from "./Thumb";

/**
 * Props for the Grid component
 */
export type GridProps = {
  /** Array of posts to display in a grid layout */
  posts: Post[];
};

/**
 * Grid component - displays posts in a responsive 3-column grid layout
 *
 * @example
 * ```tsx
 * import { Grid } from '@duyet/components'
 *
 * <Grid posts={posts} />
 * ```
 */
export default function Grid({ posts }: GridProps) {
  if (!posts) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <GridItem key={post.slug} post={post} />
      ))}
    </div>
  );
}

/**
 * GridItem component - individual item within the grid
 * @internal
 */
export function GridItem({ post }: { post: Post }) {
  return (
    <article key={post.slug} className="mb-12 bg-gray-100 p-5 border-xl">
      <Thumb url={post.thumbnail} alt={post.title} width={500} height={500} />

      <p className="mt-4 leading-relaxed">
        <Link href={`/${post.slug}`}>
          {post.title}
        </Link>
      </p>
    </article>
  );
}
