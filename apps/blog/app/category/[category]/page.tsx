import Feed from '@duyet/components/Feed'
import { getAllCategories, getPostsByCategory } from '@duyet/libs/getPost'
import { getSlug } from '@duyet/libs/getSlug'

export const dynamic = 'force-static'

interface Params {
  category: string
}

interface PostsByCategoryProps {
  params: Promise<Params>
}

export default async function PostsByCategory({
  params,
}: PostsByCategoryProps) {
  const { category } = await params
  const posts = await getPosts(category)

  return <Feed posts={posts} />
}

async function getPosts(category: Params['category']) {
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
