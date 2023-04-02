import type { InferGetStaticPropsType } from 'next'

import getSlug from '../../lib/getSlug'
import Feed from '../../components/Feed'
import Container from '../../components/Container'
import { getAllCategories, getPostsByCategory } from '../../lib/getPost'

type Props = InferGetStaticPropsType<typeof getStaticProps>

export default function PostsByCategory({ posts }: Props) {
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
    'date',
    'title',
    'excerpt',
    'thumbnail',
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
