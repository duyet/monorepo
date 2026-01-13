import fs from 'fs';
import path from 'path';

const MDX_POSTS_DIR = path.join(process.cwd(), '_posts-mdx');

export interface MdxPost {
  slug: string;
  title: string;
  date: string;
  author?: string;
  category?: string;
  tags?: string[];
  description?: string;
  featured?: boolean;
  filePath: string;
}

/**
 * Get all MDX post paths recursively
 */
export function getMdxPostPaths(dir: string = MDX_POSTS_DIR): string[] {
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const paths: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      paths.push(...getMdxPostPaths(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
      paths.push(fullPath);
    }
  }

  return paths;
}

/**
 * Extract frontmatter from MDX file
 */
export function getMdxPost(filePath: string): MdxPost {
  const content = fs.readFileSync(filePath, 'utf8');

  // Extract frontmatter from the content
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!frontmatterMatch) {
    throw new Error(`No frontmatter found in ${filePath}`);
  }

  const frontmatter = frontmatterMatch[1];
  const data: Record<string, any> = {};

  // Parse frontmatter
  frontmatter.split('\n').forEach(line => {
    const match = line.match(/^(\w+):\s*(.*)$/);
    if (match) {
      const key = match[1];
      let value = match[2];

      // Handle arrays
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(v => v.trim().replace(/^['"]|['"]$/g, ''));
      } else {
        // Remove quotes if present
        value = value.replace(/^['"]|['"]$/g, '');
      }

      data[key] = value;
    }
  });

  // Convert file path to slug
  const relativePath = path.relative(MDX_POSTS_DIR, filePath);
  const slugParts = relativePath.replace(/\.mdx$/, '').split(path.sep);
  const slug = `/${slugParts.join('/')}.html`;

  return {
    slug: data.slug || slug,
    title: data.title,
    date: data.date,
    author: data.author,
    category: data.category,
    tags: data.tags || [],
    description: data.description,
    featured: data.featured === 'true',
    filePath,
  };
}

/**
 * Get all MDX posts
 */
export function getAllMdxPosts(): MdxPost[] {
  const paths = getMdxPostPaths();
  const posts = paths.map(path => getMdxPost(path));

  // Sort by date descending
  return posts.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

/**
 * Find MDX post by slug
 */
export function findMdxPostBySlug(slug: string): MdxPost | null {
  const allPosts = getAllMdxPosts();
  const cleanSlug = slug.replace(/\.html$/, '');

  return allPosts.find(post => {
    const postSlug = post.slug.replace(/\.html$/, '');
    return postSlug === cleanSlug;
  }) || null;
}

/**
 * Check if a post exists as MDX
 */
export function isMdxPost(year: string, month: string, slug: string): boolean {
  const mdxPath = path.join(MDX_POSTS_DIR, year, month, `${slug}.mdx`);
  return fs.existsSync(mdxPath);
}