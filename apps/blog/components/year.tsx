import type { Post } from '@duyet/interfaces';
import { getPostsByYear } from '@duyet/libs/getPost';
import { cn } from '@duyet/libs/utils';
import Link from 'next/link';

export interface YearProps {
  year: number;
  className?: string;
}

export function Year({ year, className }: YearProps) {
  const posts = getPostsByYear(year, ['slug', 'title', 'date', 'category']);

  if (!posts.length) {
    return null;
  }

  return (
    <div className={cn(className)}>
      <h1
        className={cn(
          'mb-8 mt-8 text-5xl font-extrabold',
          'sm:text-6xl',
          'md:mb-10 md:mb-10 md:text-8xl md:font-black',
        )}
      >
        <Link as={`/${year}`} href="/[year]">
          {year}
        </Link>
      </h1>

      {posts.map((post: Post) => (
        <article className="mb-5" key={post.slug}>
          <div className="mb-2 flex flex-row gap-2">
            <time className="text-gray-400">{post.date.toString()}</time>
            <span className="text-gray-500">{post.category}</span>
          </div>

          <Link
            as={post.slug}
            className="text-xl font-bold md:text-2xl"
            href="/[...slug]"
          >
            {post.title}
          </Link>
        </article>
      ))}
    </div>
  );
}

export default Year;
