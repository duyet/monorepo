import Link from "next/link";

import type { Post } from "@duyet/interfaces";
import { Thumb } from "./Thumb";

export type Props = {
  posts: Post[];
};

export default function Gird({ posts }: Props) {
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

export function GridItem({ post }: { post: Post }) {
  return (
    <article key={post.slug} className="mb-12 bg-gray-100 p-5 border-xl">
      <Thumb url={post.thumbnail} alt={post.title} width={500} height={500} />

      <p className="mt-4 leading-relaxed">
        <Link as={`${post.slug}`} href="/[...slug]">
          {post.title}
        </Link>
      </p>
    </article>
  );
}
