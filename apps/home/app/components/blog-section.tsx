import Link from 'next/link'
import { CalendarIcon, ArrowRightIcon, TagIcon } from 'lucide-react'

import { getAllPosts } from '@duyet/libs/getPost'

export function BlogSection() {
  // Get latest 4 blog posts
  const latestPosts = getAllPosts(['slug', 'title', 'date', 'excerpt', 'category', 'tags'], 4)

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <section id="blog" className="py-20 bg-gray-50 dark:bg-slate-800">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Latest Blog Posts
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            I write about data engineering, distributed systems, Rust, and modern data infrastructure
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {latestPosts.map((post, index) => {
            // Extract clean blog URL
            const blogUrl = process.env.NEXT_PUBLIC_DUYET_BLOG_URL || 'https://blog.duyet.net'
            const postUrl = `${blogUrl}${post.slug}`

            return (
              <article
                key={post.slug}
                className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                {/* Category Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                    <TagIcon size={12} className="mr-1" />
                    {post.category}
                  </span>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <CalendarIcon size={16} className="mr-2" />
                    {formatDate(post.date)}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">
                  <Link
                    href={postUrl}
                    target="_blank"
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {post.title}
                  </Link>
                </h3>

                {/* Excerpt */}
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {post.tags.length > 3 && (
                      <span className="px-2 py-1 text-gray-500 dark:text-gray-500 text-xs">
                        +{post.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Read More Link */}
                <Link
                  href={postUrl}
                  target="_blank"
                  className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm group transition-colors"
                >
                  Read More
                  <ArrowRightIcon size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </article>
            )
          })}
        </div>

        {/* View All Posts Button */}
        <div className="text-center">
          <Link
            href={process.env.NEXT_PUBLIC_DUYET_BLOG_URL || 'https://blog.duyet.net'}
            target="_blank"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            View All Posts
            <ArrowRightIcon size={16} className="ml-2" />
          </Link>
        </div>
      </div>
    </section>
  )
}