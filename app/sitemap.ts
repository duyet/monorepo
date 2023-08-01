import { MetadataRoute } from 'next';

import { Post } from '../interfaces';
import { getSlug } from '../lib/getSlug';
import { getAllCategories, getAllPosts } from '../lib/getPost';

export default function sitemap(): MetadataRoute.Sitemap {
  const site_url = 'https://blog.duyet.net';
  const posts = getAllPosts(['slug', 'title', 'excerpt', 'date'], 100000);
  const categories = Object.keys(getAllCategories());

  return [
    ...posts.map((post: Post) => {
      return {
        url: `${site_url}${post.slug}`,
        lastModified: post.date,
      };
    }),
    ...categories.map((category) => {
      return {
        url: `${site_url}/category/${getSlug(category)}`,
        lastModified: new Date().toISOString(),
      };
    }),
  ];
}
