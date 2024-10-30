import Container from '@duyet/components/Container'
import { getAllPosts } from '@duyet/libs/getPost'
import type { Metadata } from 'next'
import Content, { getPost } from './content'
import Meta from './meta'

interface Params {
  year: string
  month: string
  slug: string
}

interface PostProps {
  params: Promise<Params>
}

export const dynamic = 'force-static'

// Dynamic segments not included in generateStaticParams will return a 404.
// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamicparams
export const dynamicParams = false

export default async function Post({ params }: PostProps) {
  const { year, month, slug } = await params
  const post = await getPost([year, month, slug])

  return (
    <Container>
      <article>
        <Content post={post} />
        <Meta className="mt-10" post={post} />
      </article>
    </Container>
  )
}

export async function generateStaticParams() {
  const posts = getAllPosts(['slug'])

  return posts.flatMap(({ slug }) => {
    const slugArray = slug
      .replace(/\.md|\.html$/, '.html')
      .replace(/^\//, '')
      .split('/')

    return {
      year: slugArray[0],
      month: slugArray[1],
      slug: slugArray[2],
    }
  })
}

export async function generateMetadata({
  params,
}: PostProps): Promise<Metadata> {
  const { year, month, slug } = await params
  const post = await getPost([year, month, slug])

  return {
    title: post.title,
    description: post.excerpt,
    creator: post.author,
    category: post.category,
    keywords: post.tags,
  }
}
