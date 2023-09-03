import Link from 'next/link';
import { YearList } from '@duyet/components';
import type { Post } from '@duyet/interfaces';
import { getPostsByAllYear, getPostsByYear } from '@duyet/libs/getPost';

interface YearProps {
  params: {
    year: number;
  };
}

export default function Year({ params: { year } }: YearProps) {
  const posts = getPostsByYear(year, ['slug', 'title', 'date', 'category']);

  return (
    <>
      <h1 className="text-3xl font-bold mb-5 mt-10">{year}</h1>

      {posts.map((post: Post) => (
        <article className="mb-5" key={post.slug}>
          <div className="flex flex-row gap-2 mb-2">
            <time className="text-gray-400">{post.date.toString()}</time>
            <span className="text-gray-500">{post.category}</span>
          </div>

          <Link
            as={`${post.slug}`}
            className="text-xl font-bold"
            href="/[...slug]"
          >
            {post.title}
          </Link>
        </article>
      ))}

      <div className="mt-10">
        <YearList />
      </div>
    </>
  );
}

export async function generateStaticParams() {
  const posts = getPostsByAllYear();

  return Object.keys(posts).map((year) => ({
    year,
  }));
}
