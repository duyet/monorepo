import RSS from 'rss'

import type { Post } from '../../interfaces'
import { getAllPosts } from '../../lib/getPost'

const site_url = 'https://blog.duyet.net'

export async function GET() {
  const posts = getAllPosts(['slug', 'title', 'excerpt', 'date'], 100000)

  const feed = new RSS({
    title: 'Tôi là Duyệt',
    description: 'Sr. Data Engineer. Rustacean at night',
    feed_url: `${site_url}/rss.xml`,
    site_url,
  })

  posts.forEach((post: Post) => {
    feed.item({
      title: post.title || '',
      description: post.excerpt || '',
      url: `${site_url}/${post.slug}`,
      date: post.date || new Date(),
    })
  })

  return new Response(feed.xml({ indent: true }), {
    status: 200,
    headers: {
      'Content-Type': 'text/xml',
    },
  })
}
