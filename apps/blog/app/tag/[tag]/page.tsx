import Link from 'next/link'

import Feed from '@duyet/components/Feed'
import { getAllTags, getPostsByTag } from '@duyet/libs/getPost'
import { getSlug } from '@duyet/libs/getSlug'

export const dynamic = 'force-static'
export const dynamicParams = false

interface Params {
  tag: string
}

interface PostsByTagProps {
  params: Promise<Params>
}

const POSTS_PER_PAGE = 10

export async function generateStaticParams() {
  const tags = getAllTags()

  return Object.keys(tags).map((tag: string) => ({
    tag: getSlug(tag),
  }))
}

export default async function PostsByTag({ params }: PostsByTagProps) {
  const { tag } = await params
  const posts = await getPosts(tag)
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE)

  return (
    <div>
      <h1 className="mb-16">
        Showing all {posts.length} posts from {tag} topic. Checking out{' '}
        <Link href="/tags">all my favorite topics here</Link>.
      </h1>
      <Feed posts={posts} noThumbnail />

      {totalPages > 1 && (
        <div className="mt-16 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Browse by pages:</h2>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Link
                key={pageNum}
                href={`/tag/${tag}/${pageNum}`}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Page {pageNum}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

async function getPosts(tag: Params['tag']) {
  return getPostsByTag(tag, [
    'slug',
    'date',
    'title',
    'excerpt',
    'category',
    'thumbnail',
  ])
}
