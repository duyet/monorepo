import { Container, Feed } from '@duyet/components'
import { getAllPosts } from '@duyet/libs/getPost'

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
    <Container>
      <Feed posts={posts} />
    </Container>
  )
}
