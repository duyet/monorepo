import type { InferGetStaticPropsType } from 'next'
import Link from 'next/link'

import Container from '../components/Container'
import { getAllPosts } from '../lib/getPost'

export default function Archives({
  postsByYear,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <Container>
      {Object.keys(postsByYear)
        .sort((a: string, b: string) => parseInt(b) - parseInt(a))
        .map((year: string) => {
          const posts = postsByYear[year]

          return (
            <div key={year}>
              <h1 className='text-3xl font-bold mb-5 text-sky-500'>{year}</h1>

              {posts.map((post) => (
                <article key={post.slug} className='mb-5'>
                  <div className='flex flex-row gap-2 mb-2'>
                    <time className='text-gray-400'>
                      {post.date.toString()}
                    </time>
                    <span className='text-gray-500'>{post.category}</span>
                  </div>

                  <Link
                    as={`${post.slug}`}
                    href='/[...slug]'
                    className='text-xl font-bold'
                  >
                    {post.title}
                  </Link>
                </article>
              ))}
            </div>
          )
        })}
    </Container>
  )
}

export async function getStaticProps() {
  const allPosts = getAllPosts(['slug', 'title', 'date', 'category'])

  // Post by year
  const postsByYear = allPosts.reduce((acc, post) => {
    const year = new Date(post.date).getFullYear()

    if (!acc[year]) {
      acc[year] = []
    }

    acc[year].push(post)

    return acc
  }, {})

  return {
    props: { postsByYear },
  }
}
