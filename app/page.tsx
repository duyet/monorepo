import Feed from '../components/Feed'
import Container from '../components/Container'
import { getAllPosts } from '../lib/getPost'

async function getPosts(params) {
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
    page * 10 + 10
  )
}

export default async function Page({ params }) {
  const posts = await getPosts(params)
  return (
    <Container>
      <Feed posts={posts} />
    </Container>
  )
}
