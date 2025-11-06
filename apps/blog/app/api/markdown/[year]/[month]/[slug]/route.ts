import { getPostBySlug } from '@duyet/libs/getPost'
import { NextResponse } from 'next/server'

interface Params {
  year: string
  month: string
  slug: string
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<Params> }
) {
  const { year, month, slug } = await params
  const slugPath = `${year}/${month}/${slug}`

  try {
    const post = getPostBySlug(slugPath, ['content', 'title'])

    return new NextResponse(post.content, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `inline; filename="${slug}.md"`,
      },
    })
  } catch (error) {
    return new NextResponse('Post not found', { status: 404 })
  }
}
