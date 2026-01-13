import { serialize } from "next-mdx-remote/serialize";
import { MDXRemote, MDXRemoteProps } from "next-mdx-remote";
import type { Post } from "@duyet/interfaces";
import { getPostBySlug, getPostByPath } from "@duyet/libs/getPost";

// Import all MDX components
import {
  ToolComparison,
  FeatureMatrix,
  WakaTimeChart,
  ToolTimeline,
  WorkflowDiagram,
  VersionDiff,
  ToolList,
} from "@/components/mdx";

// MDX components registry for use in .mdx files
export const mdxComponents = {
  ToolComparison,
  FeatureMatrix,
  WakaTimeChart,
  ToolTimeline,
  WorkflowDiagram,
  VersionDiff,
  ToolList,
  // Alias for consistency
  ToolComparisonBox: ToolComparison,
  FeatureMatrixTable: FeatureMatrix,
  WakaChart: WakaTimeChart,
  Timeline: ToolTimeline,
  Workflow: WorkflowDiagram,
  DiffViewer: VersionDiff,
  ToolGrid: ToolList,
};

export interface MDXPost extends Post {
  mdxContent?: any;
  isMDX: boolean;
}

/**
 * Process a post and determine if it's MDX or regular Markdown
 */
export async function processPostWithMDX(slug: string[]): Promise<MDXPost> {
  const join = () => require("node:path").join;
  const fs = () => require("node:fs");

  // Determine the file path (try both .mdx and .md)
  const fileName = slug.join("/").replace(/\.(md|mdx)$/, "");
  const postsDir = join()(
    process.cwd(),
    "_posts"
  );
  const possiblePaths = [
    join()(postsDir, `${fileName}.mdx`),
    join()(postsDir, `${fileName}.md`),
  ];

  let fullPath = possiblePaths[0]; // Default to first
  let isMDX = false;

  for (const path of possiblePaths) {
    if (fs().existsSync(path)) {
      fullPath = path;
      isMDX = path.endsWith(".mdx");
      break;
    }
  }

  // Get basic post data
  const basePost = getPostByPath(fullPath, [
    "slug",
    "title",
    "excerpt",
    "date",
    "content",
    "category",
    "category_slug",
    "tags",
    "series",
    "snippet",
  ]);

  // If it's MDX, serialize it
  if (isMDX) {
    const fileContent = fs().readFileSync(fullPath, "utf8");
    const { data, content } = require("gray-matter")(fileContent);

    // Serialize MDX content
    const mdxSource = await serialize(content, {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [],
        rehypePlugins: [],
      },
    });

    return {
      ...basePost,
      content: "", // Empty for MDX (we'll use mdxContent instead)
      mdxContent: mdxSource,
      isMDX: true,
    };
  }

  // For regular markdown, convert to HTML
  const { markdownToHtml } = await import("@duyet/libs/markdownToHtml");
  const htmlContent = await markdownToHtml(basePost.content || "");

  return {
    ...basePost,
    content: htmlContent,
    isMDX: false,
  };
}

/**
 * Get all post paths including both .md and .mdx files
 */
export function getAllPostPaths(): string[] {
  const fs = require("fs");
  const path = require("path");

  const postsDir = path.join(process.cwd(), "_posts");

  function scanDir(dir: string): string[] {
    const items = fs.readdirSync(dir);
    const paths: string[] = [];

    items.forEach((item: string) => {
      const fullPath = path.join(dir, item);
      if (fs.statSync(fullPath).isDirectory()) {
        paths.push(...scanDir(fullPath));
      } else if (item.endsWith(".md") || item.endsWith(".mdx")) {
        // Extract the relative path from _posts directory
        const relativePath = fullPath.replace(postsDir + path.sep, "");
        // Convert to URL slug format (remove extension)
        const slug = relativePath.replace(/\.(md|mdx)$/, "");
        paths.push(slug);
      }
    });

    return paths;
  }

  return scanDir(postsDir);
}

/**
 * Check if a post exists in either .md or .mdx format
 */
export function postExists(slug: string): boolean {
  const fs = require("fs");
  const path = require("path");

  const postsDir = path.join(process.cwd(), "_posts");
  const fileName = slug.replace(/\.(md|mdx)$/, "");

  const mdPath = path.join(postsDir, `${fileName}.md`);
  const mdxPath = path.join(postsDir, `${fileName}.mdx`);

  return fs.existsSync(mdxPath) || fs.existsSync(mdPath);
}

export { MDXRemote };
export type { MDXRemoteProps };