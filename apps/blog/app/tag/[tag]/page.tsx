import Feed from '@duyet/components/Feed'
import { getAllTags, getPostsByTag } from '@duyet/libs/getPost'
import { getSlug } from '@duyet/libs/getSlug'
import Link from 'next/link'

interface Params {
  tag: string
}

interface PostsByTagProps {
  params: Promise<Params>
}

export default async function PostsByTag({ params }: PostsByTagProps) {
  const { tag } = await params
  const posts = await getPosts(tag)

  return (
    <div>
      <h1 className="mb-16">
        Showing {posts.length} posts from {tag} topic. Checking out{' '}
        <Link href="/tags">all my favorite topics here</Link>.
      </h1>
      <Feed posts={posts} noThumbnail />
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

export async function generateStaticParams() {
  const tags = getAllTags()

  return Object.keys(tags).map((tag: string) => ({
    tag: getSlug(tag),
  }))
}
