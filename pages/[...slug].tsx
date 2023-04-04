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

const getGithubEditUrl = (slug: string) => {
  const file = slug.replace(/\.(md|htm|html)$/, '.md').replace(/^\/?/, '')
  return `https://github.com/duyet/new-blog/edit/master/_posts/${file}`
}

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

              <div className='flex flex-row flex-wrap gap-2 text-gray-400 mt-2 text-sm'>
                <time>{post.date.toString()}</time>
                <time>({distanceToNow(new Date(post.date))})</time>
                <span>&#x2022;</span>
                <span>
                  <Link href={`/category/${post.category_slug}`}>
                    {post.category}
                  </Link>
                </span>
                <span>&#x2022;</span>
                <span>{post.tags?.join(', ')}</span>
                <span>&#x2022;</span>
                <span>
                  <a href={post.edit_url}>Edit</a>
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
    'tags',
  ])
  const content = await markdownToHtml(post.content || '')

  return {
    props: {
      post: {
        ...post,
        content,
        edit_url: getGithubEditUrl(post.slug),
      },
    },
  }
}

export async function getStaticPaths() {
  const posts = getAllPosts(['slug'])
  const posibleExtensions = ['', '.html']

  return {
    paths: posts.flatMap(({ slug }) =>
      posibleExtensions.map((ext: string) => {
        const slugArray = slug
          .replace(/\.(md|html)$/, ext)
          .replace(/^\//, '')
          .split('/')

        return {
          params: {
            slug: slugArray,
          },
        }
      })
    ),
    fallback: false,
  }
}
