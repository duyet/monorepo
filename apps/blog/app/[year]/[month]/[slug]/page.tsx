import Container from '@duyet/components/Container'
import { getAllPosts, getPostBySlug } from '@duyet/libs/getPost'
import type { Metadata } from 'next'
import { NextResponse } from 'next/server'
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

    const base = slugArray[2].replace(/\.html$/, '')

    // Generate both .html and .md versions
    return [
      {
        year: slugArray[0],
        month: slugArray[1],
        slug: `${base}.html`,
      },
      {
        year: slugArray[0],
        month: slugArray[1],
        slug: `${base}.md`,
      },
    ]
  })
}

export default async function Post({ params }: PostProps) {
  const { year, month, slug } = await params

  // If requesting .md file, return raw markdown content
  if (slug.endsWith('.md')) {
    const slugPath = `${year}/${month}/${slug.replace(/\.md$/, '')}`
    const post = getPostBySlug(slugPath, ['content', 'title'])

    // Return raw markdown with proper content type
    return new NextResponse(post.content, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `inline; filename="${slug}"`,
      },
    })
  }

  // Otherwise, render the normal HTML page
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

export async function generateMetadata({
  params,
}: PostProps): Promise<Metadata> {
  const { year, month, slug } = await params

  // Skip metadata for .md files (they return raw content)
  if (slug.endsWith('.md')) {
    const slugPath = `${year}/${month}/${slug.replace(/\.md$/, '')}`
    const post = getPostBySlug(slugPath, ['title'])
    return {
      title: `${post.title} (Markdown)`,
    }
  }

  const post = await getPost([year, month, slug])

  return {
    title: post.title,
    description: post.excerpt,
    creator: post.author,
    category: post.category,
    keywords: post.tags,
  }
}
