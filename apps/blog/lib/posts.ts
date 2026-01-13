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

  const fileNames = fs.readdirSync(postsDirectory)
  const allPostsData: Post[] = []

  fileNames.forEach((fileName) => {
    if (fileName.endsWith('.md') || fileName.endsWith('.mdx')) {
      const slug = fileName.replace(/\.(mdx|md)$/, '')
      const fullPath = path.join(postsDirectory, fileName)
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
  })

  return allPostsData.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
}

export function getPostBySlug(slug: string): Post | null {
  if (!fs.existsSync(postsDirectory)) {
    return null
  }

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