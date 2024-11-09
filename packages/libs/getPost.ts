import matter from 'gray-matter'

import getSlug from './getSlug'
import type { TagCount, Post, CategoryCount } from '@duyet/interfaces'
import { normalizeTag } from './tags'

const nodeFs = () => require('fs')
const nodeJoin = () => require('path').join
const getPostsDirectory = () => nodeJoin()(process.cwd(), '_posts')

const CACHED: { [key: string]: any } = {}

/**
 * Get all slugs from the posts directory recursively
 */
export function getPostPaths(dir?: string): string[] {
  const fs = nodeFs()
  const join = nodeJoin()

  const _dir = dir || getPostsDirectory()
  const slugs = fs.readdirSync(_dir)

  return slugs.flatMap((file: string) => {
    const child = join(_dir, file)
    // If the file is a directory, recursively get the slugs from that directory
    if (fs.statSync(child).isDirectory()) {
      return getPostPaths(child)
    }

    if (!file.endsWith('.md')) {
      return []
    }

    return [join(_dir, file)]
  })
}

export function getPostBySlug(slug: string, fields: string[] = []): Post {
  const join = nodeJoin()
  const fileName = slug.replace(/\.(md|htm|html)$/, '')
  return getPostByPath(join(getPostsDirectory(), `${fileName}.md`), fields)
}

export function getPostByPath(fullPath: string, fields: string[] = []): Post {
  let fileContent

  if (CACHED[fullPath]) {
    fileContent = CACHED[fullPath]
  } else {
    const fs = nodeFs()
    fileContent = fs.readFileSync(fullPath, 'utf8')
    CACHED[fullPath] = fileContent
  }

  const { data, content } = matter(fileContent)

  const post: Post = {
    slug: '',
    title: '',
    date: new Date(),
    content: '',
    category: 'Unknown',
    category_slug: 'unknown',
    tags: [],
    tags_slug: [],
    snippet: '',
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
      post['title'] = data.title
    }

    if (field === 'path') {
      post['path'] = fullPath
    }

    if (field === 'date') {
      post['date'] =
        typeof post[field] === 'object' ? post[field] : new Date(post[field])
    }

    if (field === 'content') {
      post['content'] = content
    }

    if (field === 'category') {
      // Some posts have a category of "null" so we need to handle that
      post['category'] = data.category || post[field]
    }

    if (field === 'category_slug') {
      post['category_slug'] = getSlug(data.category || post[field])
    }

    if (field === 'tags') {
      post['tags'] = (data.tags || []).map(normalizeTag)
      post['tags_slug'] = post[field].map((tag: string) => getSlug(tag))
    }

    if (field === 'excerpt') {
      post[field] =
        data.description || content.split(' ').slice(0, 20).join(' ') + '...'
    }

    if (field === 'snippet') {
      post['snippet'] = data.snippet || ''
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

export function getAllCategories(): CategoryCount {
  const paths = getPostPaths()
  const posts = paths.map((path) => getPostByPath(path, ['category']))

  return posts
    .map((post) => post.category)
    .reduce(
      (acc, cat) => {
        if (acc[cat]) {
          acc[cat]++
        } else {
          acc[cat] = 1
        }

        return acc
      },
      {} as Record<string, number>
    )
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

export function getAllTags(): TagCount {
  const paths = getPostPaths()
  const posts = paths.map((path) => getPostByPath(path, ['tags']))

  return posts
    .flatMap((post) => post.tags || [])
    .reduce(
      (acc, tag) => {
        if (acc[tag]) {
          acc[tag]++
        } else {
          acc[tag] = 1
        }

        return acc
      },
      {} as Record<string, number>
    )
}

export function getPostsByTag(tag: string, fields: string[] = []): Post[] {
  const paths = getPostPaths()

  const extraFields = [...fields, 'tags']
  const posts = paths.map((path) => getPostByPath(path, extraFields))

  return posts
    .filter((post) => post.tags.includes(tag) || post.tags_slug.includes(tag))
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1))
}

export function getPostsByAllYear(
  fields: string[] = [],
  yearLimit: number = -1
): Record<number, Post[]> {
  const extraFields = [...fields, 'date']
  const allPosts = getAllPosts(extraFields)

  // Post by year
  const postsByYear = allPosts.reduce(
    (acc, post) => {
      const year = new Date(post.date).getFullYear()

      if (!acc[year]) {
        acc[year] = []
      }

      acc[year].push(post)

      return acc
    },
    {} as Record<number, Post[]>
  )

  // Sort posts by year
  Object.keys(postsByYear).forEach((year: string) => {
    postsByYear[parseInt(year)].sort((post1: Post, post2: Post) =>
      post1.date > post2.date ? -1 : 1
    )
  })

  // Limit the number of years
  if (yearLimit > 0) {
    const years = Object.keys(postsByYear).sort((year1, year2) =>
      year1 > year2 ? -1 : 1
    )
    const limitedYears = years.slice(0, yearLimit)
    return limitedYears.reduce(
      (acc, year: string) => {
        acc[parseInt(year)] = postsByYear[parseInt(year)]
        return acc
      },
      {} as Record<number, Post[]>
    )
  }

  return postsByYear
}

export function getPostsByYear(year: number, fields: string[] = []) {
  const extraFields = [...fields, 'date']
  const postByYears = getPostsByAllYear(extraFields)

  return postByYears[year] || []
}
