import { getAllPosts, getPostBySlug } from '@duyet/libs/getPost'
import { NextResponse } from 'next/server'

interface Params {
  year: string
  month: string
  'slug.md': string
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
      'slug.md': `${slugArray[2]}.md`,
    }
  })
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<Params> }
) {
  const { year, month } = await params
  const slugWithExt = (await params)['slug.md']
  const slug = slugWithExt.replace(/\.md$/, '')

  const slugPath = `${year}/${month}/${slug}`
  const post = getPostBySlug(slugPath, ['content', 'title', 'slug'])

  return new NextResponse(post.content, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `inline; filename="${slug}.md"`,
    },
  })
}
