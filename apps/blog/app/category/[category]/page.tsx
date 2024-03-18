import Feed from '@duyet/components/Feed';
import { getAllCategories, getPostsByCategory } from '@duyet/libs/getPost';
import { getSlug } from '@duyet/libs/getSlug';

interface PostsByCategoryProps {
  params: {
    category: string;
  };
}

export default async function PostsByCategory({
  params,
}: PostsByCategoryProps) {
  const posts = await getPosts(params.category);

  return <Feed posts={posts} />;
}

async function getPosts(category: PostsByCategoryProps['params']['category']) {
  return getPostsByCategory(category, [
    'slug',
    'date',
    'title',
    'excerpt',
    'category',
    'thumbnail',
  ]);
}

export async function generateStaticParams() {
  const categories = getAllCategories();

  return Object.keys(categories).map((cat: string) => ({
    category: getSlug(cat),
  }));
}
