import Link from 'next/link'

import Container from '@duyet/components/Container'
import Grid from '@duyet/components/Grid'
import { getAllPosts } from '@duyet/libs/getPost'

type Params = Promise<Record<string, string>>

async function getPosts(params: Params) {
  const { page } = await params
  const pageNumber = page ? parseInt(page) - 1 : 0

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
    pageNumber * 10 + 10,
  )
}

export default async function Archives({ params }: { params: Params }) {
  const posts = await getPosts(params)

  return (
    <Container className="max-w-6xl">
      <Grid posts={posts} />
      <Link href="/archives?ref=home">
        <div className="py-3 text-center hover:bg-gray-100 hover:underline">
          See more
        </div>
      </Link>
    </Container>
  )
}
