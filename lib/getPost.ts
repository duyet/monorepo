import fs from 'fs'
import { join } from 'path'
import matter from 'gray-matter'

import getSlug from '../lib/getSlug'
import type { Post } from '../interfaces'

const postsDirectory = join(process.cwd(), '_posts')

/**
 * Get all slugs from the posts directory recursively
 */
export function getPostPaths(dir: string = postsDirectory): string[] {
  const slugs = fs.readdirSync(dir)

  return slugs.flatMap((file) => {
    const child = join(dir, file)
    // If the file is a directory, recursively get the slugs from that directory
    if (fs.statSync(child).isDirectory()) {
      return getPostPaths(child)
    }

    if (!file.endsWith('.md')) {
      return []
    }

    return [join(dir, file)]
  })
}

export function getPostBySlug(slug: string, fields: string[] = []): Post {
  const fileName = slug.replace(/\.(md|htm|html)$/, '')
  return getPostByPath(join(postsDirectory, `${fileName}.md`), fields)
}

export function getPostByPath(fullPath: string, fields: string[] = []): Post {
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  const post: Post = {
    slug: '',
    title: '',
    date: new Date(),
    content: '',
    category: 'Unknown',
    category_slug: 'unknown',
  }

  // Ensure only the minimal needed data is exposed
  fields.forEach((field) => {
    if (field === 'slug') {
      post[field] = data.slug || fullPath

      // Validate slug format /yyyy/mm/slug(.html)
      const slugRegex = /^\/(\d{4})\/(\d{2})\/(.+)$/
      const match = post[field].match(slugRegex)
      if (!match) {
        throw new Error(
          `Invalid slug format: ${post[field]}. Please use the format /yyyy/mm/slug(.html)`
        )
      }
    }

    if (field === 'title') {
      post[field] = data.title
    }

    if (field === 'path') {
      post[field] = fullPath
    }

    if (field === 'content') {
      post[field] = content
    }

    if (field === 'category') {
      // Some posts have a category of "null" so we need to handle that
      post[field] = data.category || post[field]
    }

    if (field === 'category_slug') {
      post[field] = getSlug(data.category || post[field])
    }

    if (field === 'excerpt') {
      post[field] =
        data.description || content.split(' ').slice(0, 20).join(' ') + '...'
    }

    if (typeof data[field] !== 'undefined') {
      post[field] = data[field]
    }
  })

  return post
}

export function getAllPosts(fields: string[] = [], limit = 0): Post[] {
  const paths = getPostPaths()

  const posts = paths
    .map((path) => getPostByPath(path, fields))
    // sort posts by date in descending order
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1))

  if (limit > 0) {
    return posts.slice(0, limit)
  }

  return posts
}

export function getAllCategories(): Record<string, number> {
  const paths = getPostPaths()
  const posts = paths.map((path) => getPostByPath(path, ['category']))

  return posts
    .map((post) => post.category)
    .reduce((acc, cat) => {
      if (acc[cat]) {
        acc[cat]++
      } else {
        acc[cat] = 1
      }

      return acc
    }, {} as Record<string, number>)
}

export function getPostsByCategory(
  category: string,
  fields: string[] = []
): Post[] {
  const paths = getPostPaths()

  const extraFields = [...fields, 'category_slug']
  const posts = paths.map((path) => getPostByPath(path, extraFields))

  return posts
    .filter((post) => post.category_slug === category)
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1))
}
