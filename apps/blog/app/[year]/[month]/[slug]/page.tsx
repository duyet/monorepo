import Container from '@duyet/components/Container';
import { getAllPosts } from '@duyet/libs/getPost';
import type { Metadata } from 'next';
import Comment from './comment';
import Content, { getPost } from './content';
import Meta from './meta';

interface Params {
  year: string;
  month: string;
  slug: string;
}

interface PostProps {
  params: Params;
}

export default async function Post({
  params: { year, month, slug },
}: PostProps) {
  const post = await getPost([year, month, slug]);

  return (
    <Container>
      <article>
        <Content post={post} />
        <Meta className="mt-10" post={post} />
        <Comment className="mt-0" />
      </article>
    </Container>
  );
}

export async function generateStaticParams() {
  const posts = getAllPosts(['slug']);
  const posibleExtensions = ['', '.html'];

  return posts.flatMap(({ slug }) =>
    posibleExtensions.map((ext: string) => {
      const slugArray = slug
        .replace(/\.md|\.html$/, ext)
        .replace(/^\//, '')
        .split('/');

      return {
        year: slugArray[0],
        month: slugArray[1],
        slug: slugArray[2],
      };
    }),
  );
}

export async function generateMetadata({
  params: { year, month, slug },
}: PostProps): Promise<Metadata> {
  const post = await getPost([year, month, slug]);

  return {
    title: post.title,
    description: post.excerpt,
    creator: post.author,
    category: post.category,
    keywords: post.tags,
  };
}
