import { type TagCount } from '@duyet/interfaces'
import { getAllTags } from '@duyet/libs/getPost'
import { getSlug } from '@duyet/libs/getSlug'
import Link from 'next/link'

export default function Tags() {
  const tags: TagCount = getAllTags()

  // Sort and keep tags with > 1 post
  const sortedTags = Object.fromEntries(
    Object.entries(tags)
      .filter(([, count]) => count > 1)
      .sort(([, a], [, b]) => b - a),
  )

  return (
    <div>
      <h1 className="lg:mb-15 mb-10 text-4xl font-bold md:text-6xl lg:text-8xl">
        Tags
      </h1>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {Object.entries(sortedTags).map(([tag, count]) => (
          <div className="mb-5" key={tag}>
            <Link
              as={`/tag/${getSlug(tag)}`}
              className="flex flex-col text-lg"
              href="/tag/[tag]"
            >
              <h3 className="font-bold">{tag}</h3>
              <span className="text-sm text-muted hover:no-underline">
                {count} posts
              </span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
