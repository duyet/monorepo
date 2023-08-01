import Link from 'next/link';

import getSlug from '../../lib/getSlug';
import { getAllCategories } from '../../lib/getPost';

export default function Categories() {
  const categories = getAllCategories();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-5">Categories</h1>

      {Object.entries(categories).map(([cat, count]) => (
        <article key={cat} className="mb-5">
          <Link
            as={`/category/${getSlug(cat)}`}
            href="/category/[category]"
            className="text-blue-600"
          >
            {cat} ({count})
          </Link>
        </article>
      ))}
    </div>
  );
}
