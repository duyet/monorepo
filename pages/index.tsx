import type { InferGetStaticPropsType } from 'next'

import Feed from '../components/Feed'
import Container from '../components/Container'
import { getAllPosts } from '../lib/getPost'

export default function Home({
  posts,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <Container>
      <Feed posts={posts} />
    </Container>
  )
}

export async function getStaticProps() {
  const posts = getAllPosts(
    [
      'slug',
      'title',
      'excerpt',
      'thumbnail',
      'date',
      'category',
      'category_slug',
    ],
    20
  )

  return {
    props: { posts },
  }
}
