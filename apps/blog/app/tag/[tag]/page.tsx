import Feed from '@duyet/components/Feed'
import { getAllTags, getPostsByTag } from '@duyet/libs/getPost'
import { getSlug } from '@duyet/libs/getSlug'

interface Params {
  tag: string
}

interface PostsByTagProps {
  params: Promise<Params>
}

export default async function PostsByTag({ params }: PostsByTagProps) {
  const { tag } = await params
  const posts = await getPosts(tag)

  return <Feed posts={posts} />
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
