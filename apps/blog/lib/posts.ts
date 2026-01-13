import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'apps/blog/_posts')

export interface Post {
  slug: string
  title: string
  date: string
  author?: string
  excerpt: string
  content: string
  tags?: string[]
  featured?: boolean
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(postsDirectory)) {
    return []
  }

  const allPostsData: Post[] = []
  const years = fs.readdirSync(postsDirectory)

  for (const year of years) {
    const yearPath = path.join(postsDirectory, year)
    if (!fs.statSync(yearPath).isDirectory()) continue

    const months = fs.readdirSync(yearPath)

    for (const month of months) {
      const monthPath = path.join(yearPath, month)
      if (!fs.statSync(monthPath).isDirectory()) continue

      const files = fs.readdirSync(monthPath)

      for (const file of files) {
        if (file.endsWith('.md') || file.endsWith('.mdx')) {
          const slug = file.replace(/\.(mdx|md)$/, '')
          const fullPath = path.join(monthPath, file)
          const fileContents = fs.readFileSync(fullPath, 'utf8')
          const { data, content } = matter(fileContents)

          allPostsData.push({
            slug,
            title: data.title || slug,
            date: data.date || new Date().toISOString(),
            author: data.author,
            excerpt: data.excerpt || content.slice(0, 200) + '...',
            content,
            tags: data.tags || [],
            featured: data.featured || false,
          })
        }
      }
    }
  }

  return allPostsData.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
}

export function getPostBySlug(slug: string): Post | null {
  if (!fs.existsSync(postsDirectory)) {
    return null
  }

  // First try to find the slug in year/month directories
  const years = fs.readdirSync(postsDirectory)

  for (const year of years) {
    const yearPath = path.join(postsDirectory, year)
    if (!fs.statSync(yearPath).isDirectory()) continue

    const months = fs.readdirSync(yearPath)

    for (const month of months) {
      const monthPath = path.join(yearPath, month)
      if (!fs.statSync(monthPath).isDirectory()) continue

      const files = fs.readdirSync(monthPath)

      for (const file of files) {
        const fileName = file.replace(/\.(mdx|md)$/, '')
        if (fileName === slug) {
          const fullPath = path.join(monthPath, file)
          const fileContents = fs.readFileSync(fullPath, 'utf8')
          const { data, content } = matter(fileContents)

          return {
            slug,
            title: data.title || slug,
            date: data.date || new Date().toISOString(),
            author: data.author,
            excerpt: data.excerpt || content.slice(0, 200) + '...',
            content,
            tags: data.tags || [],
            featured: data.featured || false,
          }
        }
      }
    }
  }

  // If not found in year/month directories, try flat structure
  const possibleFiles = [
    `${slug}.mdx`,
    `${slug}.md`,
  ]

  for (const fileName of possibleFiles) {
    const fullPath = path.join(postsDirectory, fileName)

    if (fs.existsSync(fullPath)) {
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data, content } = matter(fileContents)

      return {
        slug,
        title: data.title || slug,
        date: data.date || new Date().toISOString(),
        author: data.author,
        excerpt: data.excerpt || content.slice(0, 200) + '...',
        content,
        tags: data.tags || [],
        featured: data.featured || false,
      }
    }
  }

  return null
}

export function getPostsByTag(tag: string): Post[] {
  const allPosts = getAllPosts()
  return allPosts.filter(post => post.tags?.includes(tag))
}

export function getFeaturedPosts(): Post[] {
  const allPosts = getAllPosts()
  return allPosts.filter(post => post.featured)
}