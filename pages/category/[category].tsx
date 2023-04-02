import type { InferGetStaticPropsType } from 'next'

import Feed from '../../components/Feed'
import Container from '../../components/Container'
import { getAllCategories, getPostsByCategory } from '../../lib/getPost'

export default function PostsByCategory({
  posts,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <Container>
      <Feed posts={posts} />
    </Container>
  )
}

type Params = {
  params: {
    category: string
  }
}

export async function getStaticProps({ params }: Params) {
  const posts = getPostsByCategory(params.category, [
    'slug',
    'title',
    'excerpt',
    'thumbnail',
    'date',
    'category',
  ])

  return {
    props: { posts },
  }
}

export async function getStaticPaths() {
  const categories = getAllCategories()

  return {
    paths: Object.keys(categories).map((cat: string) => {
      const category = getSlug(cat)

      return {
        params: {
          category,
        },
      }
    }),
    fallback: false,
  }
}
