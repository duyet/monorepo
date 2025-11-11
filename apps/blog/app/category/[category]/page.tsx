import Link from 'next/link'

import { YearPost } from '@/components/year-post'
import Container from '@duyet/components/Container'
import type { Post } from '@duyet/interfaces'
import { getAllCategories, getPostsByCategory } from '@duyet/libs/getPost'
import { getSlug } from '@duyet/libs/getSlug'

export const dynamic = 'force-static'
export const dynamicParams = false

interface Params {
  category: string
}

interface PostsByCategoryProps {
  params: Promise<Params>
}

// Category metadata for rich hero sections
const categoryMetadata: Record<string, { description: string; color: string }> = {
  'data-engineering': {
    description: 'Dive into the world of data pipelines, ETL processes, distributed systems, and building robust data infrastructure that scales.',
    color: 'bg-cactus-light',
  },
  'machine-learning': {
    description: 'Explore machine learning algorithms, AI applications, model training, and practical implementations in real-world scenarios.',
    color: 'bg-sage-light',
  },
  'web-development': {
    description: 'Discover modern web technologies, frontend and backend frameworks, best practices, and building performant web applications.',
    color: 'bg-lavender-light',
  },
  'rust': {
    description: 'Master systems programming with Rust, explore its powerful type system, memory safety features, and growing ecosystem.',
    color: 'bg-oat-light',
  },
  'javascript': {
    description: 'Deep dive into JavaScript, TypeScript, Node.js, and the ever-evolving ecosystem of tools and frameworks.',
    color: 'bg-coral-light',
  },
  'career': {
    description: 'Navigate the tech industry with insights on career development, professional growth, interviews, and building your path.',
    color: 'bg-terracotta-light',
  },
  'tutorial': {
    description: 'Learn through comprehensive step-by-step guides, hands-on tutorials, and practical examples you can follow along.',
    color: 'bg-ivory-medium',
  },
  'personal': {
    description: 'Personal reflections, life experiences, lessons learned, and thoughts on technology, work, and everything in between.',
    color: 'bg-cream',
  },
}

export async function generateStaticParams() {
  const categories = getAllCategories()

  return Object.keys(categories).map((cat: string) => ({
    category: getSlug(cat),
  }))
}

export default async function PostsByCategory({
  params,
}: PostsByCategoryProps) {
  const { category } = await params
  const posts = await getPosts(category)

  // Get the category display name (reverse slug to title)
  const categories = getAllCategories()
  const categoryName = Object.keys(categories).find(
    (cat) => getSlug(cat) === category,
  ) || category

  // Group posts by year
  const postsByYear = posts.reduce((acc: Record<number, Post[]>, post) => {
    const year = new Date(post.date).getFullYear()
    if (!acc[year]) {
      acc[year] = []
    }
    acc[year].push(post)
    return acc
  }, {})

  // Get metadata for this category
  const metadata = categoryMetadata[category] || {
    description: `Explore all posts in the ${categoryName} category.`,
    color: 'bg-ivory-medium',
  }

  const postCount = posts.length
  const yearCount = Object.keys(postsByYear).length

  return (
    <div className="min-h-screen">
      <Container>
        {/* Hero Banner */}
        <div className={`${metadata.color} mb-12 rounded-3xl p-8 md:p-12 lg:p-16`}>
          <div className="mb-4">
            <Link
              href="/category"
              className="inline-flex items-center text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              All Categories
            </Link>
          </div>

          <h1 className="mb-6 font-serif text-4xl font-bold text-neutral-900 md:text-5xl lg:text-6xl">
            {categoryName}
          </h1>

          <p className="mb-6 max-w-2xl text-lg leading-relaxed text-neutral-700">
            {metadata.description}
          </p>

          <div className="flex flex-wrap gap-4 text-sm font-medium text-neutral-600">
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>
                {postCount} {postCount === 1 ? 'post' : 'posts'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>
                {yearCount} {yearCount === 1 ? 'year' : 'years'}
              </span>
            </div>
          </div>
        </div>

        {/* Posts organized by year */}
        <div className="flex flex-col gap-12">
          {Object.entries(postsByYear)
            .sort(([a], [b]) => parseInt(b) - parseInt(a))
            .map(([year, yearPosts]) => (
              <YearPost
                key={year}
                year={parseInt(year)}
                posts={yearPosts}
              />
            ))}
        </div>

        {/* Empty state */}
        {posts.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-lg text-neutral-600">
              No posts found in this category yet.
            </p>
          </div>
        )}
      </Container>
    </div>
  )
}

async function getPosts(category: Params['category']) {
  return getPostsByCategory(category, [
    'slug',
    'date',
    'title',
    'category',
    'featured',
  ])
}
