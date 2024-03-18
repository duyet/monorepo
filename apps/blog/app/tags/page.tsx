import { type TagCount } from '@duyet/interfaces';
import { getAllTags } from '@duyet/libs/getPost';
import { getSlug } from '@duyet/libs/getSlug';
import Link from 'next/link';

export default function Tags() {
  const tags: TagCount = getAllTags();

  // Sort
  const sortedTags = Object.fromEntries(
    Object.entries(tags).sort(([, a], [, b]) => b - a),
  );

  return (
    <div>
      <h1 className="mb-5 text-3xl font-bold">Tags</h1>

      {Object.entries(sortedTags).map(([tag, count]) => (
        <article className="mb-5" key={tag}>
          <Link
            as={`/tag/${getSlug(tag)}`}
            className="text-blue-600"
            href="/tag/[tag]"
          >
            {tag} ({count} posts)
          </Link>
        </article>
      ))}
    </div>
  );
}
