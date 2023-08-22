import { MetadataRoute } from 'next'

import type { Post } from '@duyet/interfaces'
import { getSlug } from '@duyet/libs/getSlug'
import { getAllCategories, getAllPosts } from '@duyet/libs/getPost'

export default function sitemap(): MetadataRoute.Sitemap {
  const site_url = 'https://blog.duyet.net'
  const posts = getAllPosts(['slug', 'title', 'excerpt', 'date'], 100000)
  const categories = Object.keys(getAllCategories())

  return [
    ...posts.map((post: Post) => {
      return {
        url: `${site_url}${post.slug}`,
        lastModified: post.date,
      }
    }),
    ...categories.map((category) => {
      return {
        url: `${site_url}/category/${getSlug(category)}`,
        lastModified: new Date().toISOString(),
      }
    }),
  ]
}
