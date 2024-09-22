import Container from '@duyet/components/Container'
import Feed from '@duyet/components/Feed'
import Header from '@duyet/components/Header'
import { getAllPosts } from '@duyet/libs/getPost'
import Link from 'next/link'

type Params = Record<string, string>

async function getPosts(params: Params) {
  const page = params.page ? parseInt(params.page) - 1 : 0

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
    page * 10 + 10,
  )
}

export default async function Page({ params }: { params: Params }) {
  const posts = await getPosts(params)
  return (
    <>
      <Header center logo={false} longText="Data Engineering" />
      <Container>
        <Feed posts={posts} />
        <Link href="/archives?ref=home">
          <div className="py-3 text-center hover:bg-gray-100 hover:underline">
            See more
          </div>
        </Link>
      </Container>
    </>
  )
}
