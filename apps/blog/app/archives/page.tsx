import Link from 'next/link';
import type { Post } from '@duyet/interfaces';
import { Container, YearList } from '@duyet/components';
import { getPostsByAllYear } from '@duyet/libs/getPost';

export default function Archives() {
  const yearLimit = 5;
  const postsByYear = getPostsByAllYear(
    ['slug', 'title', 'date', 'category'],
    yearLimit,
  );

  return (
    <Container>
      <div>
        {Object.keys(postsByYear)
          .sort((a: string, b: string) => parseInt(b) - parseInt(a))
          .map((year: string) => {
            const posts = postsByYear[parseInt(year)];

            return (
              <div key={year}>
                <Link as={`/${year}`} href="/[year]">
                  <h1 className="text-3xl font-bold mb-5 mt-10">{year}</h1>
                </Link>

                {posts.map((post: Post) => (
                  <article className="mb-5" key={post.slug}>
                    <div className="flex flex-row gap-2 mb-2">
                      <time className="text-gray-400">
                        {post.date.toString()}
                      </time>
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
              </div>
            );
          })}
      </div>

      <div className="mt-10 border-top-1">
        <YearList />
      </div>
    </Container>
  );
}
