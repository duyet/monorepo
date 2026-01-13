import { remark } from "remark";
import remarkMdx from "remark-mdx";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeRaw from "rehype-raw";
import matter from "gray-matter";

/**
 * Converts markdown or MDX content to HTML
 * @param markdownContent - The markdown/MDX content string
 * @param isMdx - Whether the content is MDX (default: false)
 * @returns Promise<string> - The converted HTML string
 */
export async function markdownToHtml(
  markdownContent: string,
  isMdx: boolean = false
): Promise<string> {
  // Parse frontmatter
  const { content } = matter(markdownContent);

  if (isMdx) {
    // Process MDX with remark-mdx
    const result = await unified()
      .use(remarkParse)
      .use(remarkMdx)
      .use(remarkMath)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(rehypeKatex)
      .use(rehypeStringify)
      .process(content);

    return result.toString();
  } else {
    // Process regular markdown
    const result = await unified()
      .use(remarkParse)
      .use(remarkMath)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(rehypeKatex)
      .use(rehypeStringify)
      .process(content);

    return result.toString();
  }
}

/**
 * Extracts and processes MDX components from content
 * @param content - The content to process
 * @returns Processed content with MDX component handling
 */
export function extractMdxComponents(content: string): string {
  // This function can be extended to handle custom MDX component extraction
  // For now, it returns the content as-is since remark-mdx handles parsing
  return content;
}

/**
 * Validates if content contains MDX syntax
 * @param content - The content to check
 * @returns boolean - True if content contains MDX
 */
export function isMdxContent(content: string): boolean {
  // Check for MDX-specific patterns
  const mdxPatterns = [
    /^import\s+.*\s+from\s+['"]/m,  // import statements
    /^export\s+/m,                   // export statements
    /<([A-Z][A-Za-z0-9]*)\s*\/>/,    // JSX self-closing tags
    /<([A-Z][A-Za-z0-9]*)[\s\S]*>/,  // JSX opening tags
    /{.*}/,                           // JSX expressions
  ];

  return mdxPatterns.some(pattern => pattern.test(content));
}

/**
 * Process content and determine if it's MDX
 * @param filePath - Path to the file
 * @param content - File content
 * @returns object with processed content and MDX flag
 */
export function processContent(filePath: string, content: string) {
  const isMdx = filePath.endsWith('.mdx') || isMdxContent(content);
  return {
    content,
    isMdx,
    extension: isMdx ? 'mdx' as const : 'md' as const
  };
}