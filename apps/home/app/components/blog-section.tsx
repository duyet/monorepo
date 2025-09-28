import Link from 'next/link'
import { CalendarIcon, ArrowRightIcon, TagIcon } from 'lucide-react'
import type { Post } from '@duyet/interfaces'

interface BlogSectionProps {
  latestPosts: Post[]
}

export function BlogSection({ latestPosts }: BlogSectionProps) {

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <section id="blog" className="py-12 bg-gray-50 dark:bg-slate-800">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Latest Blog Posts
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Data engineering, distributed systems, Rust, and modern infrastructure
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {latestPosts.map((post, index) => {
            // Extract clean blog URL
            const blogUrl = process.env.NEXT_PUBLIC_DUYET_BLOG_URL || 'https://blog.duyet.net'
            const postUrl = `${blogUrl}${post.slug}`

            return (
              <article
                key={post.slug}
                className="bg-white dark:bg-slate-900 rounded-lg p-4 shadow hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700"
              >
                {/* Header with category and date */}
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                    <TagIcon size={10} className="mr-1" />
                    {post.category}
                  </span>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <CalendarIcon size={12} className="mr-1" />
                    {formatDate(post.date)}
                  </div>
                </div>

                {/* Title - More compact */}
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight">
                  <Link
                    href={postUrl}
                    target="_blank"
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {post.title}
                  </Link>
                </h3>

                {/* Excerpt - Compact */}
                <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 text-xs leading-relaxed">
                  {post.excerpt}
                </p>

                {/* Tags - Show only first 2 */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {post.tags.slice(0, 2).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {post.tags.length > 2 && (
                      <span className="px-2 py-0.5 text-gray-500 dark:text-gray-500 text-xs">
                        +{post.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}

                {/* Read More Link - Compact */}
                <Link
                  href={postUrl}
                  target="_blank"
                  className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-xs group transition-colors"
                >
                  Read More
                  <ArrowRightIcon size={12} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </article>
            )
          })}
        </div>

        {/* View All Posts Button - Compact */}
        <div className="text-center">
          <Link
            href={process.env.NEXT_PUBLIC_DUYET_BLOG_URL || 'https://blog.duyet.net'}
            target="_blank"
            className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            View All Posts
            <ArrowRightIcon size={14} className="ml-2" />
          </Link>
        </div>
      </div>
    </section>
  )
}