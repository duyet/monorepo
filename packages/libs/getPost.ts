import type { CategoryCount, Post, TagCount } from "@duyet/interfaces";
import matter from "gray-matter";
import { getReadingTime } from "./date";
import { FileSystemError, ValidationError } from "./errors";
import getSlug from "./getSlug";
import { normalizeTag } from "./tags";

// Access Node built-ins lazily without a literal require() token.
// This keeps the module browser-bundle safe and avoids Node 24's
// ESM/CJS ambiguity detection that previously broke blog prebuilds.
const nodeFs = () => process.getBuiltinModule("node:fs");
const nodeJoin = () => process.getBuiltinModule("node:path").join;
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

  const _dir = dir || getPostsDirectory();
  const entries: string[] = fs.readdirSync(_dir);

  // Pre-filter to only process markdown files or directories
  // This helps Turbopack narrow down the file pattern scope
  const filtered = entries.filter((entry: string) => {
    const ext = entry.slice(-4).toLowerCase();
    // Only process: directories, .md files, .mdx files
    return !entry.includes(".") || ext === ".mdx" || entry.slice(-3) === ".md";
  });

  return filtered.flatMap((file: string) => {
    const fullPath = `${_dir}/${file}`;
    // If the file is a directory, recursively get the slugs from that directory
    if (fs.statSync(fullPath).isDirectory()) {
      return getPostPaths(fullPath);
    }

    // Only return markdown files
    if (!file.endsWith(".md") && !file.endsWith(".mdx")) {
      return [];
    }

    return [fullPath];
  });
}

export function getPostBySlug(slug: string, fields: string[] = []): Post {
  const join = nodeJoin();
  const fs = nodeFs();
  const fileName = slug.replace(/\.(md|mdx|htm|html)$/, "");
  const postsDir = getPostsDirectory();

  // Check for .mdx first, then fall back to .md for backward compatibility
  const mdxPath = join(postsDir, `${fileName}.mdx`);
  const mdPath = join(postsDir, `${fileName}.md`);

  if (fs.existsSync(mdxPath)) {
    return getPostByPath(mdxPath, fields);
  }

  // Check if the .md file exists before attempting to read
  if (!fs.existsSync(mdPath)) {
    throw new FileSystemError(`Post not found: ${slug}`, { path: mdPath });
  }

  return getPostByPath(mdPath, fields);
}

/** Read every post on disk, projecting only the requested frontmatter fields. */
function readPosts(fields: string[]): Post[] {
  return getPostPaths().map((path) => getPostByPath(path, fields));
}

/**
 * Newest first, extracted verbatim from the three call sites that shared it.
 *
 * The tie case returns 1 rather than 0, so this is not a stable sort — two
 * same-dated posts can come out in either order. That is pre-existing behavior
 * and `getAllPosts` deliberately keeps its own title tiebreak; do not "fix"
 * this without checking what callers depend on the current ordering.
 */
const byNewest = (post1: Post, post2: Post) =>
  post1.date > post2.date ? -1 : 1;

/**
 * Tally how many times each value occurs.
 *
 * The accumulator is truthiness-based rather than `?? 0` on purpose: `acc[value]`
 * on a plain `{}` returns an inherited `Object.prototype` member for values like
 * `"constructor"`, so `?? 0` would make the count the string
 * `"function Object() {…}1"` where the original produced `NaN`. Both are wrong,
 * but keeping the original keeps this a behavior-preserving refactor. Fixing it
 * properly means seeding the accumulator with a null prototype.
 */
function countBy(values: string[]): Record<string, number> {
  return values.reduce(
    (acc, value) => {
      if (acc[value]) {
        acc[value]++;
      } else {
        acc[value] = 1;
      }

      return acc;
    },
    {} as Record<string, number>
  );
}

/** Matches the `/yyyy/mm/slug(.html)` shape every post slug must have. */
const SLUG_REGEX = /^\/(\d{4})\/(\d{2})\/(.+)$/;
/** A trailing markdown/HTML file extension, used by `parent` and `parts`. */
const MARKDOWN_EXTENSION_REGEX = /\.(md|mdx|html)$/;

type Frontmatter = { [key: string]: any };

/**
 * Projects one requested field onto the post being built. Each handler only
 * touches its own key, so a field's result never depends on the order the
 * caller listed the fields in.
 */
type FieldHandler = (
  post: Post,
  data: Frontmatter,
  content: string,
  fullPath: string
) => void;

/**
 * The shape shared by `thumbnail`, `video`, `x` and `hackerNews`: a trimmed
 * non-empty string, otherwise undefined. Non-strings and whitespace-only
 * values collapse to undefined.
 */
const trimmedString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;

/**
 * One handler per projectable field, replacing what used to be a 21-branch
 * `if (field === …)` chain.
 *
 * Two properties are load-bearing and covered by `getPost.test.ts`:
 *
 * 1. Unknown field names are silently ignored — see `defineFieldHandlers`.
 * 2. Handlers are order-independent. `tags` also writes `tags_slug`, and
 *    `category_slug` reads `data.category` rather than the value `category`
 *    wrote, so no handler can observe another. Each field is still applied
 *    once per entry in `fields`, so duplicate names stay idempotent as before.
 */
const defineFieldHandlers = (
  handlers: Record<string, FieldHandler>
): Record<string, FieldHandler | undefined> => {
  // The old chain compared `field === "…"` against literals, so a caller
  // passing `constructor`, `toString` or `__proto__` did nothing. On a plain
  // object literal those names resolve to callable `Object.prototype`
  // members, and `__proto__` resolves to a non-function that `?.()` would
  // still try to call. A null prototype keeps every unknown name absent.
  const map: Record<string, FieldHandler | undefined> = Object.create(null);

  return Object.assign(map, handlers);
};

const FIELD_HANDLERS = defineFieldHandlers({
  slug(post, data, _content, fullPath) {
    post.slug = data.slug || fullPath;

    const match = post.slug.match(SLUG_REGEX);
    if (!match) {
      throw new ValidationError(
        `Invalid slug format: ${post.slug}. Please use the format /yyyy/mm/slug(.html)`,
        { slug: post.slug, path: fullPath }
      );
    }
  },

  title(post, data) {
    post.title = data.title;
  },

  path(post, _data, _content, fullPath) {
    post.path = fullPath;
  },

  date(post, data) {
    const dateValue = data.date;
    post.date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  },

  content(post, _data, content) {
    post.content = content;
  },

  category(post, data) {
    // Some posts have a category of "null" so we need to handle that
    post.category = data.category || post.category;
  },

  category_slug(post, data) {
    post.category_slug = getSlug(data.category || post.category_slug);
  },

  tags(post, data) {
    post.tags = (data.tags || []).map(normalizeTag);
    // `tags_slug` has no handler of its own: it is a side effect of `tags`.
    post.tags_slug = post.tags.map((tag: string) => getSlug(tag));
  },

  excerpt(post, data, content) {
    post.excerpt =
      data.description || `${content.split(" ").slice(0, 20).join(" ")}...`;
  },

  snippet(post, data) {
    post.snippet = data.snippet || "";
  },

  featured(post, data) {
    post.featured = Boolean(data.featured) || false;
  },

  series(post, data) {
    post.series = data.series || undefined;
  },

  parent(post, data) {
    if (typeof data.parent === "string") {
      const normalizedParent = data.parent
        .trim()
        .replace(MARKDOWN_EXTENSION_REGEX, "")
        .replace(/\/+$/, "");
      post.parent = normalizedParent.length > 0 ? normalizedParent : undefined;
    } else {
      post.parent = undefined;
    }
  },

  parts(post, data) {
    post.parts = Array.isArray(data.parts)
      ? data.parts
          .filter((p): p is string => typeof p === "string")
          .map((p) => p.trim().replace(MARKDOWN_EXTENSION_REGEX, ""))
          .filter((p) => p.length > 0)
      : undefined;
  },

  thumbnail(post, data) {
    post.thumbnail = trimmedString(data.thumbnail);
  },

  video(post, data) {
    post.video = trimmedString(data.video);
  },

  isMDX(post, _data, _content, fullPath) {
    post.isMDX = fullPath.endsWith(".mdx");
  },

  readingTime(post, _data, content) {
    // Calculate word count from content
    const wordCount = content.split(/\s+/).filter((w) => w.length > 0).length;

    // Count code blocks for more accurate reading time
    // Fast path: skip expensive regex if no code blocks present
    const codeBlockCount = content.includes("```")
      ? (content.match(/```[\s\S]*?```/g) || []).length
      : 0;

    post.readingTime = getReadingTime(wordCount, codeBlockCount);
  },

  x(post, data) {
    post.x = trimmedString(data.x);
  },

  hackerNews(post, data) {
    post.hackerNews = trimmedString(
      data.hackerNews ?? data.hackerNewsCommentUrl
    );
  },

  changelog(post, data) {
    post.changelog = Array.isArray(data.changelog) ? data.changelog : undefined;
  },
});

export function getPostByPath(fullPath: string, fields: string[] = []): Post {
  let fileContent: string;

  const cachedContent = cacheGet(fullPath);
  if (cachedContent) {
    fileContent = cachedContent;
  } else {
    const fs = nodeFs();
    try {
      fileContent = fs.readFileSync(fullPath, "utf8");
    } catch (error) {
      throw new FileSystemError(`Failed to read post file: ${fullPath}`, {
        path: fullPath,
        cause: error instanceof Error ? error : undefined,
      });
    }
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
  for (const field of fields) {
    FIELD_HANDLERS[field]?.(post, data, content, fullPath);
  }

  return post;
}

export function getAllPosts(fields: string[] = [], limit = 0): Post[] {
  const posts = readPosts(fields).sort((post1, post2) => {
    if (post1.date > post2.date) return -1;
    if (post1.date < post2.date) return 1;
    return (post1.title || "").localeCompare(post2.title || "");
  });

  if (limit > 0) {
    return posts.slice(0, limit);
  }

  return posts;
}

export function getAllCategories(): CategoryCount {
  return countBy(readPosts(["category"]).map((post) => post.category));
}

export function getPostsByCategory(
  category: string,
  fields: string[] = []
): Post[] {
  return readPosts([...fields, "category_slug"])
    .filter((post) => post.category_slug === category)
    .sort(byNewest);
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
  return countBy(readPosts(["tags"]).flatMap((post) => post.tags || []));
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
  return readPosts([...fields, "tags"])
    .filter((post) => post.tags.includes(tag) || post.tags_slug.includes(tag))
    .sort(byNewest);
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
    postsByYear[Number.parseInt(year, 10)].sort(byNewest);
  });

  // Limit the number of years
  if (yearLimit > 0) {
    const years = Object.keys(postsByYear).sort((year1, year2) =>
      year1 > year2 ? -1 : 1
    );
    const limitedYears = years.slice(0, yearLimit);
    return limitedYears.reduce(
      (acc, year: string) => {
        acc[Number.parseInt(year, 10)] = postsByYear[Number.parseInt(year, 10)];
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
