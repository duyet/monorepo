import YearList from '@duyet/components/YearList';
import type { Post } from '@duyet/interfaces';
import { getPostsByAllYear, getPostsByYear } from '@duyet/libs/getPost';
import Link from 'next/link';
import { redirect } from 'next/navigation';

interface YearProps {
  params: {
    year: number;
  };
}

export default function Year({ params: { year } }: YearProps) {
  if (typeof year !== 'number' || isNaN(year)) {
    return redirect('/');
  }

  const posts = getPostsByYear(year, ['slug', 'title', 'date', 'category']);

  return (
    <>
      <h1 className="mb-5 mt-10 text-3xl font-bold">{year}</h1>

      {posts.map((post: Post) => (
        <article className="mb-5" key={post.slug}>
          <div className="mb-2 flex flex-row gap-2">
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
