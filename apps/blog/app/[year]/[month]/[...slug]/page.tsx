import Container from '@duyet/components/Container'
import { getAllPosts, getPostBySlug } from '@duyet/libs/getPost'
import { cn } from '@duyet/libs/utils'
import type { Metadata } from 'next'
import Link from 'next/link'

interface Params {
  year: string
  month: string
  slug: string[]
}

interface MarkdownProps {
  params: Promise<Params>
}

export const dynamic = 'force-static'
export const dynamicParams = false

export async function generateStaticParams() {
  const posts = getAllPosts(['slug'])

  return posts.map(({ slug }) => {
    const slugArray = slug
      .replace(/\.md|\.html$/, '')
      .replace(/^\//, '')
      .split('/')

    return {
      year: slugArray[0],
      month: slugArray[1],
      slug: [slugArray[2] + '.md'],
    }
  })
}

export default async function MarkdownPage({ params }: MarkdownProps) {
  const { year, month, slug } = await params
  const slugStr = slug[0].replace(/\.md$/, '')
  const slugPath = `${year}/${month}/${slugStr}`

  const post = getPostBySlug(slugPath, ['content', 'title', 'slug'])
  const htmlUrl = post.slug

  return (
    <Container>
      <article>
        <header className="mb-8 flex flex-col gap-4">
          <h1
            className={cn(
              'mt-2 inline-block break-words py-2',
              'font-serif text-neutral-900',
              'text-4xl font-bold tracking-normal',
              'md:text-5xl md:tracking-tight',
              'lg:text-6xl lg:tracking-tight',
            )}
          >
            {post.title}
          </h1>
          <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <span className="rounded-full bg-neutral-200 px-3 py-1 font-medium dark:bg-neutral-800">
              Markdown
            </span>
            <Link
              href={htmlUrl}
              className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200 underline decoration-dotted underline-offset-4"
            >
              View HTML version
            </Link>
          </div>
        </header>

        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <pre
            className={cn(
              'overflow-x-auto text-sm',
              'whitespace-pre-wrap break-words',
              'font-mono text-neutral-900 dark:text-neutral-100',
            )}
          >
            {post.content}
          </pre>
        </div>
      </article>
    </Container>
  )
}

export async function generateMetadata({
  params,
}: MarkdownProps): Promise<Metadata> {
  const { year, month, slug } = await params
  const slugStr = slug[0].replace(/\.md$/, '')
  const slugPath = `${year}/${month}/${slugStr}`
  const post = getPostBySlug(slugPath, ['title'])

  return {
    title: `${post.title} - Markdown`,
  }
}
