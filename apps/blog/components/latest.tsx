import Link from 'next/link'

import { Thumb } from '@duyet/components/Thumb'
import type { Post } from '@duyet/interfaces'
import { getAllPosts } from '@duyet/libs/getPost'
import { cn } from '@duyet/libs/utils'

export interface LatestProps {
  className?: string
}

async function getPosts(limit = 3) {
  return getAllPosts(
    [
      'date',
      'slug',
      'title',
      'excerpt',
      'thumbnail',
      'category',
      'category_slug',
    ],
    limit,
  )
}

export async function Latest({ className }: LatestProps) {
  const posts = await getPosts()

  if (!posts.length) {
    return null
  }

  return (
    <div className={cn('flex flex-col sm:flex-row justify-stretch gap-4', className)}>
      {posts.map((post: Post) => (
        <Link
          as={post.slug}
          key={post.slug}
          className="text-md flex-1 sm:basis-1/3 overflow-hidden truncate"
          href="/[...slug]"
        >
          <article className="flex h-full flex-col items-center gap-2 overflow-hidden">
            <span className="w-full truncate text-wrap font-bold text-muted-foreground">
              {post.title}
            </span>
            {post.thumbnail ? (
              <Thumb
                url={post.thumbnail}
                alt={post.title}
                className="h-auto w-auto object-cover transition-all hover:scale-105"
                unoptimized
              />
            ) : null}
          </article>
        </Link>
      ))}
    </div>
  )
}
