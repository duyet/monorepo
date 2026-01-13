import { serialize } from "next-mdx-remote/serialize";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";

// Import all MDX components
import { ToolComparison } from "@/components/mdx/ToolComparison";
import { FeatureMatrix } from "@/components/mdx/FeatureMatrix";
import { WakaTimeChart } from "@/components/mdx/WakaTimeChart";
import { ToolTimeline } from "@/components/mdx/ToolTimeline";
import { WorkflowDiagram } from "@/components/mdx/WorkflowDiagram";
import { VersionDiff } from "@/components/mdx/VersionDiff";
import { ToolList } from "@/components/mdx/ToolList";

/**
 * MDX Components bundle for use in MDXRemote
 * These are the interactive components available in MDX posts
 */
export const mdxComponents = {
  // Interactive components
  ToolComparison,
  FeatureMatrix,
  WakaTimeChart,
  ToolTimeline,
  WorkflowDiagram,
  VersionDiff,
  ToolList,

  // HTML elements customization (optional)
  h1: (props: any) => <h1 className="text-4xl font-bold mb-6 mt-8" {...props} />,
  h2: (props: any) => <h2 className="text-3xl font-bold mb-5 mt-6" {...props} />,
  h3: (props: any) => <h3 className="text-2xl font-bold mb-4 mt-4" {...props} />,
  h4: (props: any) => <h4 className="text-xl font-bold mb-3 mt-3" {...props} />,
  p: (props: any) => <p className="mb-4" {...props} />,
  ul: (props: any) => <ul className="list-disc ml-6 mb-4" {...props} />,
  ol: (props: any) => <ol className="list-decimal ml-6 mb-4" {...props} />,
  li: (props: any) => <li className="mb-1" {...props} />,
  code: (props: any) => (
    <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded font-mono text-sm" {...props} />
  ),
  pre: (props: any) => (
    <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded mb-4 overflow-x-auto" {...props} />
  ),
  blockquote: (props: any) => (
    <blockquote
      className="border-l-4 border-blue-500 pl-4 italic my-4 text-gray-600 dark:text-gray-400"
      {...props}
    />
  ),
  a: (props: any) => (
    <a
      className="text-blue-600 dark:text-blue-400 hover:underline"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
};

/**
 * Serialize MDX content for server-side processing
 * Uses next-mdx-remote with math and GFM support
 */
export async function serializeMdx(content: string) {
  return await serialize(content, {
    mdxOptions: {
      remarkPlugins: [remarkMath, remarkGfm],
      rehypePlugins: [rehypeKatex as any],
    },
    parseFrontmatter: false,
  });
}

/**
 * Render MDX content as React component
 * For server-side rendering with RSC support
 */
export async function renderMdx(content: string) {
  const { mdxSource } = await serializeMdx(content);

  // @ts-ignore - RSC component
  return MDXRemote({ source: content, components: mdxComponents });
}

/**
 * Extract MDX frontmatter from content
 * Useful for metadata extraction
 */
export function extractMdxFrontmatter(content: string): Record<string, any> {
  const frontmatterRegex = /^---\s*[\r\n]+([\s\S]*?)[\r\n]+---/;
  const match = content.match(frontmatterRegex);

  if (!match) return {};

  const frontmatterStr = match[1];
  const frontmatter: Record<string, any> = {};

  // Simple frontmatter parser for key: value pairs
  const lines = frontmatterStr.split('\n');
  lines.forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();

      // Parse arrays in brackets [item1, item2]
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(v => v.trim().replace(/["']/g, '')).filter(Boolean);
      }

      // Remove quotes from string values
      if (typeof value === 'string') {
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }

        // Parse booleans and numbers
        if (value === 'true') value = true;
        if (value === 'false') value = false;
        if (!isNaN(Number(value)) && value !== '') value = Number(value);
      }

      frontmatter[key] = value;
    }
  });

  return frontmatter;
}

/**
 * Check if content is MDX by looking for JSX syntax or imports
 */
export function isMdxContent(content: string): boolean {
  // Check for JSX component syntax
  if (content.match(/<[A-Z][a-zA-Z]*\s/)) return true;
  if (content.includes('import ') || content.includes('export ')) return true;

  // Check for known MDX component tags
  const mdxComponentTags = [
    'ToolComparison', 'FeatureMatrix', 'WakaTimeChart',
    'ToolTimeline', 'WorkflowDiagram', 'VersionDiff', 'ToolList'
  ];

  return mdxComponentTags.some(tag => content.includes(`<${tag}`));
}

/**
 * Check if file path is an MDX file
 */
export function isMdxFile(filePath: string): boolean {
  return filePath.toLowerCase().endsWith('.mdx');
}

/**
 * Process content based on file type
 * Returns serialized MDX source for MDX files, or null for regular markdown
 */
export async function processContent(content: string, isMdx: boolean) {
  if (isMdx) {
    const serialized = await serializeMdx(content);
    return serialized;
  }

  // For regular .md files, return as-is for existing processing
  return { compiledSource: content, frontmatter: {} };
}
