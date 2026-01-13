import type { Post } from "@duyet/interfaces";
import { getPostBySlug } from "@duyet/libs/getPost";
import { markdownToHtml } from "@duyet/libs/markdownToHtml";
import { cn } from "@duyet/libs/utils";
import fs from "fs";
import path from "path";

import "katex/dist/contrib/mhchem.min.js";
import "katex/dist/katex.min.css";
import { OldPostWarning } from "./old-post-warning";
import { Snippet } from "./snippet";

// MDX Components for rendering
import {
  ToolComparison,
  FeatureMatrix,
  WakaTimeChart,
  ToolTimeline,
  WorkflowDiagram,
  VersionDiff,
  ToolList,
} from "../../../../../components/mdx";

interface CustomContentProps {
  content: string;
  components?: Record<string, React.ComponentType<any>>;
}

// Component to render custom content with embedded components
function CustomContent({ content }: CustomContentProps) {
  // Parse and render the content
  // For now, this renders the processed HTML
  return (
    <div
      className={cn(
        'prose-a[href^="https://"]:after:content-["↗︎"] prose dark:prose-invert prose-code:break-words',
        "mb-10 mt-10 max-w-none"
      )}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

export default function Content({ post }: { post: Post & { interactiveContent?: any[] } }) {
  return (
    <>
      <header className="mb-8 flex flex-col gap-4">
        <h1
          className={cn(
            "mt-2 inline-block break-words py-2",
            "font-serif text-neutral-900 dark:text-neutral-100",
            "text-4xl font-bold tracking-normal",
            "md:text-5xl md:tracking-tight",
            "lg:text-6xl lg:tracking-tight"
          )}
        >
          {post.title}
        </h1>

        <OldPostWarning post={post} year={5} className="" />
      </header>

      {/* Render interactive content if available */}
      {post.interactiveContent ? (
        <div className="prose dark:prose-invert mb-10 mt-10 max-w-none">
          {post.interactiveContent.map((item, idx) => {
            switch (item.type) {
              case 'text':
                return <div key={idx} dangerouslySetInnerHTML={{ __html: item.content }} />;
              case 'ToolComparison':
                return <ToolComparison key={idx} {...item.props} />;
              case 'FeatureMatrix':
                return <FeatureMatrix key={idx} {...item.props} />;
              case 'WakaTimeChart':
                return <WakaTimeChart key={idx} {...item.props} />;
              case 'ToolTimeline':
                return <ToolTimeline key={idx} {...item.props} />;
              case 'WorkflowDiagram':
                return <WorkflowDiagram key={idx} {...item.props} />;
              case 'VersionDiff':
                return <VersionDiff key={idx} {...item.props} />;
              case 'ToolList':
                return <ToolList key={idx} {...item.props} />;
              default:
                return null;
            }
          })}
        </div>
      ) : (
        <CustomContent content={post.content || "No content"} />
      )}

      <Snippet html={post.snippet || ""} />
    </>
  );
}

export async function getPost(slug: string[]) {
  const slugStr = slug.join("/");

  // Check if this is an MDX post
  const postsDir = path.join(process.cwd(), "_posts");
  const mdxPath = path.join(postsDir, `${slugStr.replace(/\.html$/, '')}.mdx`);
  const mdPath = path.join(postsDir, `${slugStr.replace(/\.html$/, '')}.md`);

  // For MDX files, we need special handling
  if (fs.existsSync(mdxPath)) {
    // Read and process MDX content
    const fsContent = fs.readFileSync(mdxPath, 'utf8');

    // Extract frontmatter
    const frontmatterMatch = fsContent.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
    const content = frontmatterMatch
      ? fsContent.slice(frontmatterMatch[0].length)
      : fsContent;

    // Parse frontmatter to get metadata
    const data: Record<string, any> = {};
    if (frontmatterMatch) {
      frontmatterMatch[1].split('\n').forEach(line => {
        const match = line.match(/^(\w+):\s*(.*)$/);
        if (match) {
          let value = match[2].replace(/^['"]|['"]$/g, '');
          if (value.startsWith('[') && value.endsWith(']')) {
            value = value.slice(1, -1).split(',').map(v => v.trim().replace(/^['"]|['"]$/g, ''));
          }
          data[match[1]] = value;
        }
      });
    }

    // Parse MDX content to extract interactive components
    const interactiveContent = parseMdxContent(content);

    // Also generate static HTML for the rest
    const staticContent = await generateStaticHtml(content);

    return {
      slug: data.slug || slugStr,
      title: data.title,
      date: data.date ? new Date(data.date) : new Date(),
      excerpt: data.description || '',
      content: staticContent,
      interactiveContent: interactiveContent,
      category: data.category || 'Unknown',
      category_slug: data.category ? data.category.toLowerCase().replace(/\s+/g, '-') : 'unknown',
      tags: data.tags || [],
      tags_slug: (data.tags || []).map((t: string) => t.toLowerCase().replace(/\s+/g, '-')),
      snippet: data.snippet || '',
      featured: data.featured === 'true',
      series: data.series,
      edit_url: getGithubEditUrl(slugStr, true),
    };
  }

  // Otherwise use existing markdown handling
  const post = getPostBySlug(slugStr, [
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
    "featured",
  ]);
  const markdownContent = post.content || "Error";
  const content = await markdownToHtml(markdownContent);

  return {
    ...post,
    content,
    markdown_content: markdownContent,
    edit_url: getGithubEditUrl(post.slug, false),
  };
}

// Parse MDX content and extract interactive components
function parseMdxContent(content: string): any[] {
  const result: any[] = [];

  // Split content into blocks
  const lines = content.split('\n');
  let currentText: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip import statements
    if (line.trim().startsWith('import ') || line.trim().startsWith('from ')) {
      continue;
    }

    // Skip export statements
    if (line.trim().startsWith('export ') || line.trim() === '') {
      continue;
    }

    // Check for component JSX
    if (line.trim().startsWith('<') && !line.trim().startsWith('<!--')) {
      // Process component
      if (currentText.length > 0) {
        result.push({ type: 'text', content: currentText.join('\n') });
        currentText = [];
      }

      // Extract component name and props
      const componentMatch = line.match(/<(\w+)(\s+[^>]*)?\/>/) || line.match(/<(\w+)(\s+[^>]*)?>/);
      if (componentMatch) {
        const componentName = componentMatch[1];
        let props: any = {};

        // Handle props
        const propsStr = componentMatch[2] || '';
        const propMatches = propsStr.matchAll(/(\w+)={([^}]+)}/g);

        for (const match of propMatches) {
          const propName = match[1];
          let propValue = match[2];

          try {
            // Try to parse as JSON
            props[propName] = JSON.parse(propValue);
          } catch {
            // If parsing fails, keep as string (for simple values)
            props[propName] = propValue;
          }
        }

        // If this is a complex component, we need to handle multiple lines
        // For simplicity, we'll look ahead for closing tags
        if (line.includes('/>')) {
          // Self-closing tag
          result.push({ type: componentName, props });
        } else {
          // Multi-line component - find end
          let componentLines = [line];
          let j = i + 1;
          while (j < lines.length && !lines[j].includes(`</${componentName}>`)) {
            componentLines.push(lines[j]);
            j++;
          }
          if (j < lines.length) {
            componentLines.push(lines[j]);
            i = j; // Skip to end of component

            // For inline data, we'll extract from the content
            const fullComponent = componentLines.join('\n');
            if (componentName === 'ToolComparison') {
              const dataMatch = fullComponent.match(/tools={\[([\s\S]*?)\]}/);
              if (dataMatch) {
                props.tools = extractToolComparisonData(dataMatch[1]);
              }
            } else if (componentName === 'FeatureMatrix') {
              const dataMatch = fullComponent.match(/data={\[([\s\S]*?)\]}/);
              const toolsMatch = fullComponent.match(/tools={\[([\s\S]*?)\]}/);
              if (dataMatch) {
                props.data = extractFeatureMatrixData(dataMatch[1]);
              }
              if (toolsMatch) {
                // Extract tool names from array
                const toolsStr = toolsMatch[1].replace(/"/g, '').split(',').map(s => s.trim());
                props.tools = toolsStr;
              }
            } else if (componentName === 'WakaTimeChart') {
              const dataMatch = fullComponent.match(/data={\[([\s\S]*?)\]}/);
              if (dataMatch) {
                props.data = extractWakaTimeData(dataMatch[1]);
              }
            } else if (componentName === 'ToolTimeline') {
              const itemsMatch = fullComponent.match(/items={\[([\s\S]*?)\]}/);
              const orientationMatch = fullComponent.match(/orientation="([^"]+)"/);
              if (itemsMatch) {
                props.items = extractTimelineData(itemsMatch[1], orientationMatch && orientationMatch[1] === 'vertical');
              }
              if (orientationMatch) {
                props.orientation = orientationMatch[1];
              }
            } else if (componentName === 'WorkflowDiagram') {
              const stepsMatch = fullComponent.match(/steps={\[([\s\S]*?)\]}/);
              const variantMatch = fullComponent.match(/variant="([^"]+)"/);
              if (stepsMatch) {
                props.steps = extractWorkflowData(stepsMatch[1]);
              }
              if (variantMatch) {
                props.variant = variantMatch[1];
              }
            } else if (componentName === 'VersionDiff') {
              const linesMatch = fullComponent.match(/lines={\[([\s\S]*?)\]}/);
              const oldVersionMatch = fullComponent.match(/oldVersion="([^"]+)"/);
              const newVersionMatch = fullComponent.match(/newVersion="([^"]+)"/);
              const filenameMatch = fullComponent.match(/filename="([^"]+)"/);

              if (linesMatch) {
                props.lines = extractVersionDiffData(linesMatch[1]);
              }
              if (oldVersionMatch) props.oldVersion = oldVersionMatch[1];
              if (newVersionMatch) props.newVersion = newVersionMatch[1];
              if (filenameMatch) props.filename = filenameMatch[1];
            } else if (componentName === 'ToolList') {
              const toolsMatch = fullComponent.match(/tools={\[([\s\S]*?)\]}/);
              if (toolsMatch) {
                props.tools = extractToolListData(toolsMatch[1]);
              }
            }

            result.push({ type: componentName, props });
          }
        }
      }
    } else {
      // Regular text
      currentText.push(line);
    }
  }

  if (currentText.length > 0) {
    result.push({ type: 'text', content: currentText.join('\n') });
  }

  return result;
}

// Helper functions to extract data from component props using JSON-like format
function extractToolComparisonData(dataStr: string): any[] {
  // Remove newlines and extra spaces
  const cleaned = dataStr.replace(/\s+/g, ' ').trim();

  // Try to parse as JSON array (simplified for common patterns)
  try {
    // Match objects in the array
    const objects = [];
    const objectMatches = cleaned.match(/{[^}]+}/g);
    if (objectMatches) {
      for (const match of objectMatches) {
        // Extract name
        const nameMatch = match.match(/name:\s*"([^"]+)"/);
        const name = nameMatch ? nameMatch[1] : '';

        // Extract rating
        const ratingMatch = match.match(/rating:\s*(\d+)/);
        const rating = ratingMatch ? parseInt(ratingMatch[1]) : 0;

        // Extract pros array
        const prosMatch = match.match(/pros:\s*\[([^\]]+)\]/);
        const pros = prosMatch ? prosMatch[1].split(',').map(s => s.trim().replace(/^"|"$/g, '')) : [];

        // Extract cons array
        const consMatch = match.match(/cons:\s*\[([^\]]+)\]/);
        const cons = consMatch ? consMatch[1].split(',').map(s => s.trim().replace(/^"|"$/g, '')) : [];

        if (name) {
          objects.push({ name, rating, pros, cons });
        }
      }
    }
    return objects.length > 0 ? objects : [
      { name: "React", pros: ["Huge ecosystem", "Great documentation"], cons: ["Steep learning curve"], rating: 4 },
      { name: "Vue", pros: ["Easy to learn"], cons: ["Smaller ecosystem"], rating: 3 }
    ];
  } catch {
    return [
      { name: "React", pros: ["Huge ecosystem", "Great documentation"], cons: ["Steep learning curve"], rating: 4 },
      { name: "Vue", pros: ["Easy to learn"], cons: ["Smaller ecosystem"], rating: 3 }
    ];
  }
}

function extractFeatureMatrixData(dataStr: string): any[] {
  const cleaned = dataStr.replace(/\s+/g, ' ').trim();

  try {
    const objects = [];
    const objectMatches = cleaned.match(/{[^}]+}/g);
    if (objectMatches) {
      for (const match of objectMatches) {
        const featureMatch = match.match(/feature:\s*"([^"]+)"/);
        const tool1Match = match.match(/tool1:\s*(\d+)/);
        const tool2Match = match.match(/tool2:\s*(\d+)/);
        const tool3Match = match.match(/tool3:\s*(\d+)/);

        if (featureMatch) {
          objects.push({
            feature: featureMatch[1],
            tool1: tool1Match ? parseInt(tool1Match[1]) : 0,
            tool2: tool2Match ? parseInt(tool2Match[1]) : 0,
            tool3: tool3Match ? parseInt(tool3Match[1]) : 0
          });
        }
      }
    }
    return objects.length > 0 ? objects : [
      { feature: "Performance", tool1: 9, tool2: 7, tool3: 8 },
      { feature: "Ecosystem", tool1: 10, tool2: 8, tool3: 6 }
    ];
  } catch {
    return [
      { feature: "Performance", tool1: 9, tool2: 7, tool3: 8 },
      { feature: "Ecosystem", tool1: 10, tool2: 8, tool3: 6 }
    ];
  }
}

function extractWakaTimeData(dataStr: string): any[] {
  const cleaned = dataStr.replace(/\s+/g, ' ').trim();

  try {
    const objects = [];
    const objectMatches = cleaned.match(/{[^}]+}/g);
    if (objectMatches) {
      for (const match of objectMatches) {
        const dateMatch = match.match(/date:\s*"([^"]+)"/);
        const codingMatch = match.match(/coding:\s*([\d.]+)/);
        const reviewingMatch = match.match(/reviewing:\s*([\d.]+)/);
        const debuggingMatch = match.match(/debugging:\s*([\d.]+)/);
        const meetingsMatch = match.match(/meetings:\s*([\d.]+)/);

        if (dateMatch) {
          objects.push({
            date: dateMatch[1],
            coding: codingMatch ? parseFloat(codingMatch[1]) : 0,
            reviewing: reviewingMatch ? parseFloat(reviewingMatch[1]) : 0,
            debugging: debuggingMatch ? parseFloat(debuggingMatch[1]) : 0,
            meetings: meetingsMatch ? parseFloat(meetingsMatch[1]) : 0
          });
        }
      }
    }
    return objects.length > 0 ? objects : [
      { date: "Mon", coding: 4.5, reviewing: 1.2, debugging: 1.8, meetings: 0.5 }
    ];
  } catch {
    return [{ date: "Mon", coding: 4.5, reviewing: 1.2, debugging: 1.8, meetings: 0.5 }];
  }
}

function extractTimelineData(dataStr: string, isVertical: boolean): any[] {
  const cleaned = dataStr.replace(/\s+/g, ' ').trim();

  try {
    const objects = [];
    const objectMatches = cleaned.match(/{[^}]+}/g);
    if (objectMatches) {
      for (const match of objectMatches) {
        const dateMatch = match.match(/date:\s*"([^"]+)"/);
        const titleMatch = match.match(/title:\s*"([^"]+)"/);
        const descMatch = match.match(/description:\s*"([^"]+)"/);
        const variantMatch = match.match(/variant:\s*"([^"]+)"/);

        if (dateMatch && titleMatch) {
          objects.push({
            date: dateMatch[1],
            title: titleMatch[1],
            description: descMatch ? descMatch[1] : undefined,
            variant: variantMatch ? variantMatch[1] : undefined
          });
        }
      }
    }
    return objects;
  } catch {
    return [];
  }
}

function extractWorkflowData(dataStr: string): any[] {
  const cleaned = dataStr.replace(/\s+/g, ' ').trim();

  try {
    const objects = [];
    const objectMatches = cleaned.match(/{[^}]+}/g);
    if (objectMatches) {
      for (const match of objectMatches) {
        const labelMatch = match.match(/label:\s*"([^"]+)"/);
        const iconMatch = match.match(/icon:\s*"([^"]+)"/);

        if (labelMatch) {
          objects.push({
            label: labelMatch[1],
            icon: iconMatch ? iconMatch[1] : undefined
          });
        }
      }
    }
    return objects;
  } catch {
    return [];
  }
}

function extractVersionDiffData(dataStr: string): any[] {
  const cleaned = dataStr.replace(/\s+/g, ' ').trim();

  try {
    const objects = [];
    const objectMatches = cleaned.match(/{[^}]+}/g);
    if (objectMatches) {
      for (const match of objectMatches) {
        const typeMatch = match.match(/type:\s*'([^']+)'/);
        const contentMatch = match.match(/content:\s*'([^']+)'/);
        const lineMatch = match.match(/line:\s*(\d+)/);

        if (typeMatch && contentMatch) {
          objects.push({
            type: typeMatch[1],
            content: contentMatch[1],
            line: lineMatch ? parseInt(lineMatch[1]) : undefined
          });
        }
      }
    }
    return objects;
  } catch {
    return [];
  }
}

function extractToolListData(dataStr: string): any[] {
  const cleaned = dataStr.replace(/\s+/g, ' ').trim();

  try {
    const objects = [];
    const objectMatches = cleaned.match(/{[^}]+}/g);
    if (objectMatches) {
      for (const match of objectMatches) {
        const nameMatch = match.match(/name:\s*"([^"]+)"/);
        const descMatch = match.match(/description:\s*"([^"]+)"/);
        const catMatch = match.match(/category:\s*"([^"]+)"/);
        const urlMatch = match.match(/url:\s*"([^"]+)"/);

        if (nameMatch) {
          objects.push({
            name: nameMatch[1],
            description: descMatch ? descMatch[1] : '',
            category: catMatch ? catMatch[1] : 'Misc',
            tags: [], // Would need more complex parsing
            url: urlMatch ? urlMatch[1] : '#'
          });
        }
      }
    }
    return objects;
  } catch {
    return [];
  }
}

// Generate static HTML from MDX (for the prose rendering)
async function generateStaticHtml(content: string): Promise<string> {
  // Remove import/export statements
  let cleanContent = content
    .replace(/^import\s+.*\s+from\s+.*;?\s*$/gm, '')
    .replace(/^export\s+default\s+.*;?\s*$/gm, '');

  // Replace components with placeholders or HTML representations
  cleanContent = cleanContent
    .replace(/<ToolComparison[^>]*\/>/g, '<div class="mdx-component" data-type="ToolComparison">Tool Comparison Component</div>')
    .replace(/<FeatureMatrix[^>]*\/>/g, '<div class="mdx-component" data-type="FeatureMatrix">Feature Matrix Component</div>')
    .replace(/<WakaTimeChart[^>]*\/>/g, '<div class="mdx-component" data-type="WakaTimeChart">WakaTime Chart Component</div>')
    .replace(/<ToolTimeline[^>]*\/>/g, '<div class="mdx-component" data-type="ToolTimeline">Tool Timeline Component</div>')
    .replace(/<WorkflowDiagram[^>]*\/>/g, '<div class="mdx-component" data-type="WorkflowDiagram">Workflow Diagram Component</div>')
    .replace(/<VersionDiff[^>]*\/>/g, '<div class="mdx-component" data-type="VersionDiff">Version Diff Component</div>')
    .replace(/<ToolList[^>]*\/>/g, '<div class="mdx-component" data-type="ToolList">Tool List Component</div>');

  return await markdownToHtml(cleanContent);
}

const getGithubEditUrl = (slug: string, isMdx: boolean) => {
  const extension = isMdx ? ".mdx" : ".md";
  const file = slug.replace(/\.html$/, extension).replace(/^\/?/, "");
  const repoUrl =
    process.env.NEXT_PUBLIC_GITHUB_REPO_URL ||
    "https://github.com/duyet/monorepo";
  const dir = isMdx ? "_posts-mdx" : "_posts";
  return `${repoUrl}/edit/master/apps/blog/${dir}/${file}`;
};
