import Link from 'next/link'
import { kv } from '@vercel/kv'
import type { Comment } from '@duyet/interfaces'
import { Container, CommentContent } from '@duyet/components'

const URL_PREFIX = 'https://blog.duyet.net'

// Revalidate every hour
export const revalidate = 3600

export default async function Comments() {
  const urls = await kv.keys(`${URL_PREFIX}/*`)
  const commentArray = await Promise.all(
    urls.flatMap(async (url: string) => {
      const comments = await kv.lrange<Comment>(url, 0, -1)
      return comments
    }),
  )
  const comments = commentArray.flat()

  return (
    <Container className="">
      <h1 className="text-3xl font-bold">Comments</h1>
      <div className="space-y-6 mt-10">
        {comments.map((comment) => {
          return (
            <div
              className="flex flex-col prose dark:prose-invert"
              key={comment.created_at}
            >
              <Link className="text-primary mb-2 " href={comment.url}>
                {comment.url.replace(URL_PREFIX, '')}
              </Link>
              <CommentContent
                className="not-prose"
                comment={comment}
                key={comment.created_at}
              />
            </div>
          )
        })}
      </div>
    </Container>
  )
}
