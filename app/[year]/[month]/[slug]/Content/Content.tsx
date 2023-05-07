import { Post } from '../../../../../interfaces'
import { getPostBySlug } from '../../../../../lib/getPost'
import markdownToHtml from '../../../../../lib/markdownToHtml'

export default function Content({ post }: { post: Post }) {
  return (
    <>
      <header className='prose dark:prose-invert'>
        <h1>{post.title}</h1>
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
  const content = await markdownToHtml(post.content || 'Error')

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
