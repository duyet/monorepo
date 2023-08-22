import { Metadata } from 'next'

import Meta from './Meta'
import Comment from './Comment'
import Content, { getPost } from './Content'
import { getAllPosts } from '@duyet/libs/getPost'
import { Container } from '@duyet/components'

type Params = {
  year: string
  month: string
  slug: string
}

type Props = {
  params: Params
}

export default async function Post({
  params: { year, month, slug },
}: {
  params: Params
}) {
  const post = await getPost([year, month, slug])

  return (
    <Container>
      <article>
        <Content post={post} />
        <Meta post={post} className="mt-10" />
        <Comment className="mt-0" />
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
        year: slugArray[0],
        month: slugArray[1],
        slug: slugArray[2],
      }
    }),
  )
}

export async function generateMetadata({
  params: { year, month, slug },
}: Props): Promise<Metadata> {
  const post = await getPost([year, month, slug])

  return {
    title: post.title,
    description: post.excerpt,
    creator: post.author,
    category: post.category,
    keywords: post.tags,
  }
}
