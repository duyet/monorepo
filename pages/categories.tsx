import type { InferGetStaticPropsType } from 'next'
import Link from 'next/link'

import Container from '../components/Container'
import getSlug from '../lib/getSlug'
import { getAllCategories } from '../lib/getPost'

export default function Categories({
  categories,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <Container>
      <div>
        <h1 className='text-3xl font-bold mb-5'>Categories</h1>

        {Object.entries(categories).map(([cat, count]) => (
          <article key={cat} className='mb-5'>
            <Link
              as={`/category/${getSlug(cat)}`}
              href='/category/[category]'
              className='text-sky-600'
            >
              {cat} ({count})
            </Link>
          </article>
        ))}
      </div>
    </Container>
  )
}

export async function getStaticProps() {
  const categories = getAllCategories()

  return {
    props: { categories },
  }
}
