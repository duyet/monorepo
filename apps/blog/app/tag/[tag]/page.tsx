import Feed from '@duyet/components/Feed';
import { getAllTags, getPostsByTag } from '@duyet/libs/getPost';
import { getSlug } from '@duyet/libs/getSlug';

interface PostsByTagProps {
  params: {
    tag: string;
  };
}

export default async function PostsByTag({ params }: PostsByTagProps) {
  const posts = await getPosts(params.tag);

  return <Feed posts={posts} />;
}

async function getPosts(tag: PostsByTagProps['params']['tag']) {
  return getPostsByTag(tag, [
    'slug',
    'date',
    'title',
    'excerpt',
    'category',
    'thumbnail',
  ]);
}

export async function generateStaticParams() {
  const tags = getAllTags();

  return Object.keys(tags).map((tag: string) => ({
    tag: getSlug(tag),
  }));
}
