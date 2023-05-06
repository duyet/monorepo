import { MetadataRoute } from 'next'

import { getAllPosts } from '../lib/getPost'
import { Post } from '../interfaces'

export default function sitemap(): MetadataRoute.Sitemap {
  const site_url = 'https://blog.duyet.net'
  const posts = getAllPosts(['slug', 'title', 'excerpt', 'date'], 100000)

  return posts.map((post: Post) => {
    return {
      url: `${site_url}/${post.slug}`,
      lastModified: post.date,
    }
  })
}
