import type { Post } from '@duyet/interfaces';
import { getPostBySlug } from '@duyet/libs/getPost';
import { markdownToHtml } from '@duyet/libs/markdownToHtml';
import { cn } from '@duyet/libs/utils';

import 'katex/dist/contrib/mhchem.min.js';
import 'katex/dist/katex.min.css';

export default function Content({ post }: { post: Post }) {
  return (
    <>
      <header>
        <h1
          className={cn(
            'mt-2 inline-block break-words py-2',
            'dark:from-gray-50 dark:to-gray-300',
            'text-4xl font-bold tracking-normal',
            'md:text-5xl md:tracking-tighter',
            'lg:text-6xl lg:tracking-tighter',
          )}
        >
          {post.title}
        </h1>
      </header>

      <article
        className={cn(
          'prose-a[href^="https://"]:after:content-["↗︎"] prose dark:prose-invert prose-code:break-words',
          'mb-10 mt-10 max-w-none',
        )}
        dangerouslySetInnerHTML={{ __html: post.content || 'No content' }}
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
    'series',
  ]);
  const content = await markdownToHtml(post.content || 'Error');

  return {
    ...post,
    content,
    edit_url: getGithubEditUrl(post.slug),
  };
}

// TODO: remove hardcode
const getGithubEditUrl = (slug: string) => {
  const file = slug.replace(/\.md|\.html|\.htm$/, '.md').replace(/^\/?/, '');
  return `https://github.com/duyet/monorepo/edit/master/apps/blog/_posts/${file}`;
};
