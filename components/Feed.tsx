import Link from 'next/link';
import Image from 'next/image';

import type { Post } from '../interfaces';
import distanceToNow from '../lib/dateRelative';

export type Props = {
  posts: Post[];
};

const Thumb = ({ url, alt }: { url?: string; alt?: string }) => {
  if (!url) return null;

  if (url.startsWith('http://')) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} className="mt-4" alt={alt} />;
  }

  return (
    <Image
      src={url}
      className="mt-4"
      width={800}
      height={300}
      alt={alt || ''}
    />
  );
};

export default function Feed({ posts }: Props) {
  return (
    <>
      {posts.length ? (
        posts.map((post) => (
          <article key={post.slug} className="mb-20">
            <div className="flex flex-row gap-2 mb-2 text-gray-400">
              <time>{post.date.toString()}</time>
              <time>({distanceToNow(new Date(post.date))})</time>

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
              className="block text-2xl font-semibold"
            >
              {post.title}
            </Link>

            <p className="mt-4 leading-relaxed">{post.excerpt}</p>

            <Thumb url={post.thumbnail} alt={post.title} />
          </article>
        ))
      ) : (
        <p>No blog posted yet :/</p>
      )}
    </>
  );
}
