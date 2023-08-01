import getSlug from '../../../lib/getSlug'
import Feed from '../../../components/Feed'
import { getAllCategories, getPostsByCategory } from '../../../lib/getPost'

type Props = {
  params: {
    category: string
  }
}

export default async function PostsByCategory({ params }: Props) {
  const posts = await getPosts(params.category)

  return <Feed posts={posts} />
}

async function getPosts(category: Props['params']['category']) {
  return getPostsByCategory(category, [
    'slug',
    'date',
    'title',
    'excerpt',
    'category',
    'thumbnail',
  ])
}

export async function generateStaticParams() {
  const categories = getAllCategories()

  return Object.keys(categories).map((cat: string) => ({
    category: getSlug(cat),
  }))
}
