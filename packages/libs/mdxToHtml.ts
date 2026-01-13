import { serialize } from "next-mdx-remote/serialize";
import type { MDXRemoteSerializeResult } from "next-mdx-remote/rsc";

/**
 * Serialize MDX content with options
 */
export async function serializeMDX(
  content: string,
  options: {
    parseFrontmatter?: boolean;
    scope?: Record<string, any>;
  } = {}
): Promise<MDXRemoteSerializeResult> {
  const { parseFrontmatter = false, scope = {} } = options;

  return await serialize(content, {
    parseFrontmatter,
    scope,
    // Enable MDX features
    mdxOptions: {
      remarkPlugins: [],
      rehypePlugins: [],
    },
  });
}

/**
 * Check if content is MDX (contains components or import statements)
 */
export function isMDXContent(content: string): boolean {
  // Check for MDX-specific syntax
  const mdxPatterns = [
    /<\w+\s*\/>/, // Self-closing components
    /<\w+>/, // Opening tags
    /import\s+.*from\s+['"].*['"]/, // Import statements
    /export\s+const\s+\w+\s*=/, // Export statements
  ];

  return mdxPatterns.some(pattern => pattern.test(content));
}

/**
 * Get file extension preference (.mdx over .md)
 */
export function getFileExtension(filename: string): "mdx" | "md" | null {
  if (filename.endsWith(".mdx")) return "mdx";
  if (filename.endsWith(".md")) return "md";
  return null;
}

/**
 * Convert .md to .mdx extension
 */
export function toMDXExtension(filename: string): string {
  return filename.replace(/\.md$/, ".mdx");
}

/**
 * Check if a file supports MDX by checking existence of .mdx version
 */
export function supportsMDX(basePath: string): boolean {
  // This would need file system access in practice
  // Just indicates capability
  return true;
}

export type { MDXRemoteSerializeResult };

export default {
  serializeMDX,
  isMDXContent,
  getFileExtension,
  toMDXExtension,
  supportsMDX,
};