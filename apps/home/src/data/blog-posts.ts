import rawBlogPosts from "../../../blog/public/posts-data.json";

export type BlogPost = {
  slug: string;
  title: string;
};

const blogBySlug = new Map<string, BlogPost>(
  (rawBlogPosts as BlogPost[]).map((post) => [post.slug, post])
);

/** Resolve project `blogPosts` slugs to known blog entries, dropping unknowns. */
export function resolveBlogPosts(
  slugs: string[] | undefined,
  limit?: number
): BlogPost[] {
  const posts = (slugs ?? [])
    .map((slug) => blogBySlug.get(slug))
    .filter((post): post is BlogPost => post !== undefined);
  return limit === undefined ? posts : posts.slice(0, limit);
}

export function blogPostHref(slug: string): string {
  return `https://blog.duyet.net${slug}`;
}
