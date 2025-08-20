import { type TagCount } from '@duyet/interfaces'
import { getAllTags } from '@duyet/libs/getPost'
import { getSlug } from '@duyet/libs/getSlug'
import Link from 'next/link'

export default function Tags() {
  const tags: TagCount = getAllTags()

  const sortedTags = Object.fromEntries(
    Object.entries(tags).sort(([, a], [, b]) => b - a),
  )

  // { "A": {tag1: 1, tag2: 10}, "B": ... }
  const groupedTagsByAlphabet: Record<string, TagCount> = Object.entries(
    sortedTags,
  ).reduce<Record<string, TagCount>>((acc, [tag, count]) => {
    // Safety check: ensure tag exists and has at least one character
    if (!tag || tag.length === 0) {
      return acc
    }
    const firstLetter = tag[0].toUpperCase()
    acc[firstLetter] = { ...acc[firstLetter], [tag]: count }
    return acc
  }, {})

  const sortedAlpha = Object.keys(groupedTagsByAlphabet).sort()

  return (
    <div>
      <div className="lg:mb-15 mb-10">
        <h1 className="mb-5 text-4xl font-bold md:text-6xl lg:text-8xl">
          Topics
        </h1>
        <p className="lg:mb-15 mb-10">
          This page lists my {Object.keys(sortedTags).length} blogging topics in
          alphabetical order.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {sortedAlpha.map((alpha) => (
          <div className="mb-5" key={alpha}>
            <h1 className="mb-5 text-5xl font-bold">{alpha}</h1>
            <TagList tags={groupedTagsByAlphabet[alpha]} />
          </div>
        ))}
      </div>
    </div>
  )
}

function TagList({ tags }: { tags: TagCount }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
      {Object.entries(tags).map(([tag, count]) => (
        <div key={tag}>
          <Link
            href={`/tag/${getSlug(tag)}`}
            className="group inline-flex gap-1"
          >
            <h3>{tag}</h3>
            <span className="text-muted hover:no-underline">({count})</span>
          </Link>
        </div>
      ))}
    </div>
  )
}
