import type { Series } from "@duyet/interfaces";
import { getPostByPath, getPostPaths } from "./getPost";
import getSlug from "./getSlug";

export function getAllSeries(): Series[] {
  const paths = getPostPaths();
  const posts = paths.map((path) =>
    getPostByPath(path, ["slug", "title", "series", "date", "excerpt"])
  );

  // Sort posts by date
  posts.sort((post1, post2) => (post1.date > post2.date ? -1 : 1));

  return posts.reduce((acc, post) => {
    // If the post doesn't have a series, skip it
    if (!post.series) {
      return acc;
    }

    const slug = getSlug(post.series);

    // If the series is already in the list, update the posts
    if (acc.find((s: Series) => s.slug === slug)) {
      // Add the current post to the series
      acc.find((s: Series) => s.slug === slug)?.posts.push(post);

      return acc;
    }

    // Else insert the series into the list, with current post as the first post
    acc.push({
      name: post.series,
      slug,
      posts: [post],
    });

    return acc;
  }, [] as Series[]);
}

export function getSeries({
  slug,
  name,
}: {
  slug?: string;
  name?: string;
}): Series | null {
  if (!name && !slug) {
    return null;
  }

  // Load all posts
  const paths = getPostPaths();
  const posts = paths.map((path) =>
    getPostByPath(path, ["slug", "title", "series", "date", "excerpt"])
  );

  // Series slug
  const _slug = slug ? slug : getSlug(name as string);

  // Find
  const seriesPosts = posts.filter((post) => getSlug(post.series) === _slug);

  if (seriesPosts.length === 0) {
    return null;
  }

  // Sort posts by date
  seriesPosts.sort((post1, post2) => (post1.date < post2.date ? -1 : 1));

  return {
    name: seriesPosts[0].series!,
    slug: _slug,
    posts: seriesPosts,
  };
}
