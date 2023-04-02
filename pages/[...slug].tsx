import Head from 'next/head'
import Link from 'next/link'
import ErrorPage from 'next/error'
import { useRouter } from 'next/router'
import type { InferGetStaticPropsType } from 'next'

import Comment from '../components/Comment'
import Container from '../components/Container'
import distanceToNow from '../lib/dateRelative'
import { getAllPosts, getPostBySlug } from '../lib/getPost'
import markdownToHtml from '../lib/markdownToHtml'

export default function Post({
  post,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter()

  if (!router.isFallback && !post?.slug) {
    return <ErrorPage statusCode={404} />
  }

  return (
    <Container>
      <Head>
        <title>{post.title}</title>
      </Head>

      {router.isFallback ? (
        <div>Loading ...</div>
      ) : (
        <div>
          <article>
            <header>
              <h1 className='text-4xl font-bold'>{post.title}</h1>

              <div className='flex flex-row gap-2'>
                <time className='mt-2 text-gray-400'>
                  {distanceToNow(new Date(post.date))}
                </time>
                <span className='mt-2 text-gray-400'>&#x2022;</span>
                <span className='mt-2 text-gray-400'>
                  in{' '}
                  <Link href={`/category/${post.category_slug}`}>
                    {post.category}
                  </Link>
                </span>
              </div>
            </header>

            <div
              className='prose mt-10 max-w-none'
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>

          <Comment />
        </div>
      )}
    </Container>
  )
}

type Params = {
  params: {
    slug: string[]
  }
}

export async function getStaticProps({ params }: Params) {
  const post = getPostBySlug(params.slug.join('/'), [
    'slug',
    'title',
    'excerpt',
    'date',
    'content',
    'category',
    'category_slug',
  ])
  const content = await markdownToHtml(post.content || '')

  return {
    props: {
      post: {
        ...post,
        content,
      },
    },
  }
}

export async function getStaticPaths() {
  const posts = getAllPosts(['slug'])

  return {
    paths: posts.map(({ slug }) => {
      const slugArray = slug.replace(/^\//, '').split('/')
      return {
        params: {
          slug: slugArray,
        },
      }
    }),
    fallback: false,
  }
}
