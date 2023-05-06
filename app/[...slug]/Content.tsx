import Link from 'next/link'

import distanceToNow from '../../lib/dateRelative'
import { getPostBySlug } from '../../lib/getPost'
import markdownToHtml from '../../lib/markdownToHtml'
import { Post } from '../../interfaces'

export default function Content({ post }: { post: Post }) {
  return (
    <>
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
        className='prose dark:prose-invert mt-10 mb-10 max-w-none'
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </>
  )
}

export async function getPost(slug: string[]) {
  const post = getPostBySlug(slug.join('/'), [
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
    ...post,
    content,
    edit_url: getGithubEditUrl(post.slug),
  }
}

const getGithubEditUrl = (slug: string) => {
  const file = slug.replace(/\.(md|htm|html)$/, '.md').replace(/^\/?/, '')
  return `https://github.com/duyet/new-blog/edit/master/_posts/${file}`
}
