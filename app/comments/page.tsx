import Link from 'next/link';
import { kv } from '@vercel/kv';

import type { Comment } from '../../interfaces';
import Container from '../../components/Container';
import CommentContent from '../../components/CommentContent';

const URL_PREFIX = 'https://blog.duyet.net';

// Revalidate every hour
export const revalidate = 3600;

export default async function Comments() {
  const urls = await kv.keys(URL_PREFIX + '/*');
  const commentArray = await Promise.all(
    urls.flatMap(async (url: string) => {
      const comments = await kv.lrange<Comment>(url, 0, -1);
      return comments;
    }),
  );
  const comments = commentArray.flat();

  return (
    <Container className="">
      <h1 className="text-3xl font-bold">Comments</h1>
      <div className="space-y-6 mt-10">
        {comments.map((comment) => {
          return (
            <div
              key={comment.created_at}
              className="flex flex-col prose dark:prose-invert"
            >
              <Link href={comment.url} className="text-primary mb-2 ">
                {comment.url.replace(URL_PREFIX, '')}
              </Link>
              <CommentContent
                key={comment.created_at}
                className="not-prose"
                comment={comment}
              />
            </div>
          );
        })}
      </div>
    </Container>
  );
}
