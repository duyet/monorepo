import Link from 'next/link';
import { getSlug } from '@duyet/libs/getSlug';
import { getAllCategories } from '@duyet/libs/getPost';

export default function Categories() {
  const categories = getAllCategories();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-5">Categories</h1>

      {Object.entries(categories).map(([cat, count]) => (
        <article className="mb-5" key={cat}>
          <Link
            as={`/category/${getSlug(cat)}`}
            className="text-blue-600"
            href="/category/[category]"
          >
            {cat} ({count})
          </Link>
        </article>
      ))}
    </div>
  );
}
