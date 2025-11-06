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
export const dynamicParams = false

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

export default async function Post({ params }: PostProps) {
  const { year, month, slug } = await params
  const post = await getPost([year, month, slug])
  const markdownUrl = post.slug.replace(/\.html$/, '.md')

  return (
    <Container>
      <article>
        <Content post={post} />
        <div className="mt-10 flex items-center gap-2 border-t border-neutral-200 pt-4 text-sm text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
          <a
            href={markdownUrl}
            className="hover:text-neutral-900 dark:hover:text-neutral-200 underline decoration-dotted underline-offset-4"
            title="View raw markdown content (AI-friendly)"
          >
            View as Markdown
          </a>
        </div>
        <Meta className="mt-6" post={post} />
      </article>
    </Container>
  )
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
