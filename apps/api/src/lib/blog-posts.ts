export const POSTS_DATA_URL = "https://blog.duyet.net/posts-data.json";
const CACHE_TTL_MS = 60 * 60_000;

let cache: { slugs: ReadonlySet<string>; at: number } | null = null;

export function resetPostSlugsCacheForTests(): void {
  cache = null;
}

function slugOf(entry: unknown): string | null {
  if (typeof entry !== "object" || entry === null || !("slug" in entry)) {
    return null;
  }
  return typeof entry.slug === "string" ? entry.slug : null;
}

async function fetchPostSlugs(): Promise<ReadonlySet<string>> {
  const response = await fetch(POSTS_DATA_URL);
  if (!response.ok) {
    throw new Error(`posts-data fetch failed: ${response.status}`);
  }
  const data: unknown = await response.json();
  if (!Array.isArray(data)) throw new Error("posts-data is not an array");
  const slugs = new Set<string>();
  for (const entry of data) {
    const slug = slugOf(entry);
    if (slug !== null) slugs.add(slug);
  }
  return slugs;
}

export async function getPostSlugs(
  now = Date.now()
): Promise<ReadonlySet<string>> {
  if (cache && now - cache.at < CACHE_TTL_MS) return cache.slugs;
  try {
    const slugs = await fetchPostSlugs();
    cache = { slugs, at: now };
    return slugs;
  } catch (error) {
    if (cache) return cache.slugs;
    throw error;
  }
}
