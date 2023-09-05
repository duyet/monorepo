import { cn } from '@duyet/libs';
import type { Post } from '@duyet/interfaces';
import { getPostBySlug } from '@duyet/libs/getPost';
import markdownToHtml from '@duyet/libs/markdownToHtml';

export default function Content({ post }: { post: Post }) {
  return (
    <>
      <header className="prose dark:prose-invert">
        <h1>{post.title}</h1>
      </header>

      <article
        className={cn('prose dark:prose-invert', 'mt-10 mb-10 max-w-none')}
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </>
  );
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
  ]);
  const content = await markdownToHtml(post.content || 'Error');

  return {
    ...post,
    content,
    edit_url: getGithubEditUrl(post.slug),
  };
}

const getGithubEditUrl = (slug: string) => {
  const file = slug.replace(/\.md|htm|html$/, '.md').replace(/^\/?/, '');
  return `https://github.com/duyet/new-blog/edit/master/_posts/${file}`;
};
