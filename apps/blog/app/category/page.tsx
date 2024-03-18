import { getAllCategories } from '@duyet/libs/getPost';
import { getSlug } from '@duyet/libs/getSlug';
import Link from 'next/link';

export default function Categories() {
  const categories = getAllCategories();

  return (
    <div>
      <h1 className="mb-5 text-3xl font-bold">Categories</h1>

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
