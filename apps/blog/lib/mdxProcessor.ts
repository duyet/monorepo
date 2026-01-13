import { serialize } from "next-mdx-remote/serialize";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

// Import all MDX components
import { ToolComparison } from "@/components/mdx/ToolComparison";
import { FeatureMatrix } from "@/components/mdx/FeatureMatrix";
import { WakaTimeChart } from "@/components/mdx/WakaTimeChart";
import { ToolTimeline } from "@/components/mdx/ToolTimeline";
import { WorkflowDiagram } from "@/components/mdx/WorkflowDiagram";
import { VersionDiff } from "@/components/mdx/VersionDiff";
import { ToolList } from "@/components/mdx/ToolList";

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
  h1: (props: any) => <h1 className="text-4xl font-bold mb-6" {...props} />,
  h2: (props: any) => <h2 className="text-3xl font-bold mb-5" {...props} />,
  h3: (props: any) => <h3 className="text-2xl font-bold mb-4" {...props} />,
  p: (props: any) => <p className="mb-4" {...props} />,
  li: (props: any) => <li className="ml-6 mb-2" {...props} />,
  code: (props: any) => <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded" {...props} />,
  pre: (props: any) => <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded mb-4 overflow-x-auto" {...props} />,
};

/**
 * Serialize MDX content for server-side processing
 * Uses next-mdx-remote with math support
 */
export async function serializeMdx(content: string) {
  return await serialize(content, {
    mdxOptions: {
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex as any],
    },
    parseFrontmatter: false,
  });
}

/**
 * Render MDX content as React component
 * For server-side rendering with rsc support
 */
export async function renderMdx(content: string) {
  const { mdxSource } = await serializeMdx(content);

  // In RSC, we directly use MDXRemote with serialized source
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

      // Parse arrays in brackets
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(v => v.trim().replace(/"/g, '')).filter(Boolean);
      }

      // Remove quotes from string values
      if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }

      frontmatter[key] = value;
    }
  });

  return frontmatter;
}

/**
 * Check if content is MDX
 */
export function isMdxContent(content: string): boolean {
  // Check if content contains JSX syntax or imports
  return content.includes('{') || content.includes('<') || content.includes('import ') || content.includes('export ');
}

/**
 * Process content based on file type
 */
export async function processContent(content: string, isMdx: boolean) {
  if (isMdx) {
    const serialized = await serializeMdx(content);
    return serialized;
  }

  // For regular .md files, return as-is for existing processing
  return { compiledSource: content };
}