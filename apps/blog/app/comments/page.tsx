import CommentContent from '@duyet/components/CommentContent';
import Container from '@duyet/components/Container';
import type { Comment } from '@duyet/interfaces';
import { kv } from '@vercel/kv';
import Link from 'next/link';

const URL_PREFIX = 'https://blog.duyet.net';

// Revalidate every hour
export const revalidate = 3600;

export default async function Comments() {
  const urls = await kv.keys(`${URL_PREFIX}/*`);
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
      <div className="mt-10 space-y-6">
        {comments.map((comment) => {
          return (
            <div
              className="prose flex flex-col dark:prose-invert"
              key={comment.created_at}
            >
              <Link className="mb-2 text-primary " href={comment.url}>
                {comment.url.replace(URL_PREFIX, '')}
              </Link>
              <CommentContent
                className="not-prose"
                comment={comment}
                key={comment.created_at}
              />
            </div>
          );
        })}
      </div>
    </Container>
  );
}
