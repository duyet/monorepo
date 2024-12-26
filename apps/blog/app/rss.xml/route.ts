import type { Post } from '@duyet/interfaces'
import { getAllPosts } from '@duyet/libs/getPost'
import RSS from 'rss'

const siteUrl = 'https://blog.duyet.net'
export const dynamic = 'force-static'

export async function GET() {
  const posts = getAllPosts(['slug', 'title', 'excerpt', 'date'], 100000)

  const feed = new RSS({
    title: 'Tôi là Duyệt',
    description: 'Sr. Data Engineer. Rustacean at night',
    feed_url: `${siteUrl}/rss.xml`,
    site_url: siteUrl,
  })

  posts.forEach((post: Post) => {
    feed.item({
      title: post.title || '',
      description: post.excerpt || '',
      url: `${siteUrl}/${post.slug}`,
      date: post.date,
    })
  })

  return new Response(feed.xml({ indent: true }), {
    status: 200,
    headers: {
      'Content-Type': 'text/xml',
    },
  })
}
