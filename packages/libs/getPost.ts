import matter from "gray-matter";

import getSlug from "./getSlug";
import type { TagCount, Post, CategoryCount } from "@duyet/interfaces";
import { normalizeTag } from "./tags";

const nodeFs = () => require("node:fs");
const nodeJoin = () => require("node:path").join;
const getPostsDirectory = () => nodeJoin()(process.cwd(), "_posts");

const CACHED = new Map<string, string>();
const MAX_CACHE_SIZE = 500;

function cacheGet(key: string): string | undefined {
  return CACHED.get(key);
}

function cacheSet(key: string, value: string): void {
  if (CACHED.size >= MAX_CACHE_SIZE) {
    const firstKey = CACHED.keys().next().value;
    if (firstKey !== undefined) {
      CACHED.delete(firstKey);
    }
  }
  CACHED.set(key, value);
}

/**
 * Get all slugs from the posts directory recursively
 *
 * @remarks This function is used by the blog app to generate static paths.
 * The directory is scoped to the blog app's _posts folder to avoid overly broad
 * file pattern matching in the build system.
 */
export function getPostPaths(dir?: string): string[] {
  const fs = nodeFs();
  const join = nodeJoin();

  const _dir = dir || getPostsDirectory();
  const slugs = fs.readdirSync(_dir);

  return slugs.flatMap((file: string) => {
    const child = join(_dir, file);
    // If the file is a directory, recursively get the slugs from that directory
    if (fs.statSync(child).isDirectory()) {
      return getPostPaths(child);
    }

    if (!file.endsWith(".md") && !file.endsWith(".mdx")) {
      return [];
    }

    return [join(_dir, file)];
  });
}

export function getPostBySlug(slug: string, fields: string[] = []): Post {
  const join = nodeJoin();
  const fileName = slug.replace(/\.(md|mdx|htm|html)$/, "");

  // Try .mdx first, then fall back to .md for backward compatibility
  const mdxPath = join(getPostsDirectory(), `${fileName}.mdx`);
  const mdPath = join(getPostsDirectory(), `${fileName}.md`);

  try {
    return getPostByPath(mdxPath, fields);
  } catch (error) {
    return getPostByPath(mdPath, fields);
  }
}

export function getPostByPath(fullPath: string, fields: string[] = []): Post {
  let fileContent;

  const cachedContent = cacheGet(fullPath);
  if (cachedContent) {
    fileContent = cachedContent;
  } else {
    const fs = nodeFs();
    fileContent = fs.readFileSync(fullPath, "utf8");
    cacheSet(fullPath, fileContent);
  }

  const { data, content } = matter(fileContent);

  const post: Post = {
    slug: "",
    title: "",
    date: new Date(),
    content: "",
    category: "Unknown",
    category_slug: "unknown",
    tags: [],
    tags_slug: [],
    snippet: "",
    featured: false,
  };

  // Ensure only the minimal needed data is exposed
  fields.forEach((field) => {
    if (field === "slug") {
      post[field] = data.slug || fullPath;

      // Validate slug format /yyyy/mm/slug(.html)
      const slugRegex = /^\/(\d{4})\/(\d{2})\/(.+)$/;
      const match = post[field].match(slugRegex);
      if (!match) {
        throw new Error(
          `Invalid slug format: ${post[field]}. Please use the format /yyyy/mm/slug(.html)`
        );
      }
    }

    if (field === "title") {
      post.title = data.title;
    }

    if (field === "path") {
      post.path = fullPath;
    }

    if (field === "date") {
      const dateValue = data[field];
      post.date =
        dateValue instanceof Date ? dateValue : new Date(dateValue);
    }

    if (field === "content") {
      post.content = content;
    }

    if (field === "category") {
      // Some posts have a category of "null" so we need to handle that
      post.category = data.category || post[field];
    }

    if (field === "category_slug") {
      post.category_slug = getSlug(data.category || post[field]);
    }

    if (field === "tags") {
      post.tags = (data.tags || []).map(normalizeTag);
      post.tags_slug = post[field].map((tag: string) => getSlug(tag));
    }

    if (field === "excerpt") {
      post[field] =
        data.description || `${content.split(" ").slice(0, 20).join(" ")}...`;
    }

    if (field === "snippet") {
      post.snippet = data.snippet || "";
    }

    if (field === "featured") {
      post.featured = Boolean(data.featured) || false;
    }

    if (field === "series") {
      post.series = data.series || undefined;
    }
  });

  return post;
}

export function getAllPosts(fields: string[] = [], limit = 0): Post[] {
  const paths = getPostPaths();

  const posts = paths
    .map((path) => getPostByPath(path, fields))
    // sort posts by date in descending order
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));

  if (limit > 0) {
    return posts.slice(0, limit);
  }

  return posts;
}

export function getAllCategories(): CategoryCount {
  const paths = getPostPaths();
  const posts = paths.map((path) => getPostByPath(path, ["category"]));

  return posts
    .map((post) => post.category)
    .reduce(
      (acc, cat) => {
        if (acc[cat]) {
          acc[cat]++;
        } else {
          acc[cat] = 1;
        }

        return acc;
      },
      {} as Record<string, number>
    );
}

export function getPostsByCategory(
  category: string,
  fields: string[] = []
): Post[] {
  const paths = getPostPaths();

  const extraFields = [...fields, "category_slug"];
  const posts = paths.map((path) => getPostByPath(path, extraFields));

  return posts
    .filter((post) => post.category_slug === category)
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
}

/**
 * Retrieves all unique tags from all posts and counts their occurrences.
 *
 * This function scans through all posts in the blog, extracts their tags,
 * and creates a count of how many times each tag appears across all posts.
 *
 * @returns {TagCount} An object where each key is a unique tag and its value
 * is the number of times that tag appears across all posts. The type TagCount
 * is defined as Record<string, number>.
 */
export function getAllTags(): TagCount {
  const paths = getPostPaths();
  const posts = paths.map((path) => getPostByPath(path, ["tags"]));

  return posts
    .flatMap((post) => post.tags || [])
    .reduce(
      (acc, tag) => {
        if (acc[tag]) {
          acc[tag]++;
        } else {
          acc[tag] = 1;
        }

        return acc;
      },
      {} as Record<string, number>
    );
}

/**
 * Retrieves posts that have the specified tag.
 *
 * @param tag - The tag to filter posts by.
 * @param fields - An optional array of fields to include in the returned posts.
 *
 * @returns An array of posts that have the specified tag. The posts are sorted by date in descending order.
 *
 * @throws Will throw an error if the tag format is invalid.
 */
export function getPostsByTag(tag: string, fields: string[] = []): Post[] {
  const paths = getPostPaths();

  const extraFields = [...fields, "tags"];
  const posts = paths.map((path) => getPostByPath(path, extraFields));

  return posts
    .filter((post) => post.tags.includes(tag) || post.tags_slug.includes(tag))
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
}

export function getPostsByAllYear(
  fields: string[] = [],
  yearLimit = -1,
  featured?: boolean
): Record<number, Post[]> {
  const extraFields = [...fields, "date", "featured"];
  let allPosts = getAllPosts(extraFields);

  if (featured !== undefined) {
    allPosts = allPosts.filter((post) => post.featured === true);
  }

  // Post by year
  const postsByYear = allPosts.reduce(
    (acc, post) => {
      const year = new Date(post.date).getFullYear();

      if (!acc[year]) {
        acc[year] = [];
      }

      acc[year].push(post);

      return acc;
    },
    {} as Record<number, Post[]>
  );

  // Sort posts by year
  Object.keys(postsByYear).forEach((year: string) => {
    postsByYear[Number.parseInt(year)].sort((post1: Post, post2: Post) =>
      post1.date > post2.date ? -1 : 1
    );
  });

  // Limit the number of years
  if (yearLimit > 0) {
    const years = Object.keys(postsByYear).sort((year1, year2) =>
      year1 > year2 ? -1 : 1
    );
    const limitedYears = years.slice(0, yearLimit);
    return limitedYears.reduce(
      (acc, year: string) => {
        acc[Number.parseInt(year)] = postsByYear[Number.parseInt(year)];
        return acc;
      },
      {} as Record<number, Post[]>
    );
  }

  return postsByYear;
}

export function getPostsByYear(year: number, fields: string[] = []) {
  const extraFields = [...fields, "date", "featured"];
  const postByYears = getPostsByAllYear(extraFields);

  return postByYears[year] || [];
}
