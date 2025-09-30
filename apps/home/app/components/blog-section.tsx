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
    <section id="blog" className="py-6 px-4 bg-claude-beige border-b border-claude-tan">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-claude-black">
            Latest Posts
          </h2>
          <Link
            href={process.env.NEXT_PUBLIC_DUYET_BLOG_URL || 'https://blog.duyet.net'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-claude-copper hover:text-claude-orange transition-colors"
          >
            View all
            <ArrowRightIcon size={14} className="ml-1" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          {latestPosts.map((post) => {
            const blogUrl = process.env.NEXT_PUBLIC_DUYET_BLOG_URL || 'https://blog.duyet.net'
            const postUrl = `${blogUrl}${post.slug}`

            return (
              <article
                key={post.slug}
                className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-claude-tan hover:border-claude-copper transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-claude-beige text-claude-brown text-xs font-medium rounded">
                    {post.category}
                  </span>
                  <span className="text-xs text-claude-gray-600">
                    {formatDate(post.date)}
                  </span>
                </div>

                <h3 className="text-sm font-medium text-claude-black mb-1.5 line-clamp-2 leading-snug">
                  <Link
                    href={postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-claude-copper transition-colors"
                  >
                    {post.title}
                  </Link>
                </h3>

                <p className="text-xs text-claude-gray-700 line-clamp-2 leading-relaxed">
                  {post.excerpt}
                </p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}