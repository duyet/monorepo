import Link from 'next/link'

import Container from '@duyet/components/Container'
import { type TagCount } from '@duyet/interfaces'
import { getAllTags } from '@duyet/libs/getPost'
import { getSlug } from '@duyet/libs/getSlug'

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
    <div className="min-h-screen">
      <Container>
        <div className="mb-12">
          <h1 className="mb-6 font-serif text-5xl font-bold text-neutral-900 md:text-6xl lg:text-7xl">
            Topics
          </h1>
          <p className="text-lg leading-relaxed text-neutral-700">
            This page lists my{' '}
            <strong className="font-semibold text-neutral-900">
              {Object.keys(sortedTags).length} blogging topics
            </strong>{' '}
            in alphabetical order.
          </p>
        </div>

        <div className="flex flex-col gap-12">
          {sortedAlpha.map((alpha) => (
            <div key={alpha}>
              <h2 className="mb-6 font-serif text-4xl font-bold text-neutral-900 md:text-5xl">
                {alpha}
              </h2>
              <TagList tags={groupedTagsByAlphabet[alpha]} />
            </div>
          ))}
        </div>
      </Container>
    </div>
  )
}

function TagList({ tags }: { tags: TagCount }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Object.entries(tags).map(([tag, count]) => (
        <Link
          key={tag}
          href={`/tag/${getSlug(tag)}`}
          className="bg-ivory-medium group inline-flex items-baseline gap-2 rounded-lg px-4 py-3 transition-all hover:bg-neutral-200 hover:shadow-sm"
        >
          <h3 className="flex-1 text-base font-medium text-neutral-800 group-hover:text-neutral-900">
            {tag}
          </h3>
          <span className="text-lg font-semibold text-neutral-600">
            {count}
          </span>
        </Link>
      ))}
    </div>
  )
}
