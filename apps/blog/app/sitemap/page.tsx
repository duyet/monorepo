import type { Post } from '@duyet/interfaces'
import { getAllCategories, getAllPosts } from '@duyet/libs/getPost'
import { getSlug } from '@duyet/libs/getSlug'
import Link from 'next/link'

export const dynamic = 'force-static'

export default function SitemapPage() {
  const posts = getAllPosts(['slug', 'title', 'excerpt', 'date'], 100000)
  const categories = Object.keys(getAllCategories())

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Sitemap</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Blog Posts ({posts.length})</h2>
          <ul className="space-y-2">
            {posts.map((post: Post) => (
              <li key={post.slug}>
                <Link 
                  href={post.slug}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  {post.title}
                </Link>
                <div className="text-sm text-gray-500">
                  {new Date(post.date).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Categories ({categories.length})</h2>
          <ul className="space-y-2">
            {categories.map((category) => (
              <li key={category}>
                <Link 
                  href={`/category/${getSlug(category)}`}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  {category}
                </Link>
              </li>
            ))}
          </ul>

          <h2 className="text-2xl font-semibold mb-4 mt-8">Pages</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/" className="text-blue-600 hover:text-blue-800 underline">
                Home
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-blue-600 hover:text-blue-800 underline">
                About
              </Link>
            </li>
            <li>
              <Link href="/archives" className="text-blue-600 hover:text-blue-800 underline">
                Archives
              </Link>
            </li>
            <li>
              <Link href="/featured" className="text-blue-600 hover:text-blue-800 underline">
                Featured
              </Link>
            </li>
            <li>
              <Link href="/tags" className="text-blue-600 hover:text-blue-800 underline">
                Tags
              </Link>
            </li>
            <li>
              <Link href="/series" className="text-blue-600 hover:text-blue-800 underline">
                Series
              </Link>
            </li>
          </ul>
        </section>
      </div>

      <div className="mt-8 pt-4 border-t text-sm text-gray-500">
        <p>This sitemap is also available in XML format at <Link href="/sitemap.xml" className="underline">/sitemap.xml</Link></p>
      </div>
    </div>
  )
}