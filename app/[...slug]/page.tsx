import Comment from '../../components/Comment'
import Container from '../../components/Container'
import { getAllPosts } from '../../lib/getPost'

import Content, { getPost } from './Content'

type Params = {
  slug: string[]
}

export default async function Post({ params: { slug } }: { params: Params }) {
  const post = await getPost(slug)

  if (!post) return null

  return (
    <Container>
      <article>
        <Content post={post} />
        <Comment />
      </article>
    </Container>
  )
}

export async function generateStaticParams() {
  const posts = getAllPosts(['slug'])
  const posibleExtensions = ['', '.html']

  return posts.flatMap(({ slug }) =>
    posibleExtensions.map((ext: string) => {
      const slugArray = slug
        .replace(/\.(md|html)$/, ext)
        .replace(/^\//, '')
        .split('/')

      return {
        slug: slugArray,
      }
    })
  )
}
