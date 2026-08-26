/**
 * Builds the KB knowledge graph (nodes + edges) from loaded content.
 *
 * Used by `scripts/generate-static-files.ts` at build time (to emit
 * `public/graph-data.json`) and by local-graph route loaders at prerender
 * time (to compute a note's neighborhood).
 */

import {
  type Article,
  type ContentItem,
  extractWikilinks,
  getAllContent,
  type InboxNote,
  type MemoryNote,
} from "./content";

export interface GraphNode {
  id: string;
  label: string;
  kind: "article" | "memory" | "inbox" | "tag";
  memoryType?: string;
  href: string;
  tags: string[];
  description: string;
  updated: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  kind: "link" | "tag";
}

export interface GraphData {
  generated: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

function isArticle(item: ContentItem): item is Article {
  return "summary" in item;
}

function isMemory(item: ContentItem): item is MemoryNote {
  return "memoryType" in item;
}

function isInbox(item: ContentItem): item is InboxNote {
  return "date" in item;
}

import { kbSlugify as slugify } from "@duyet/libs/slugify";

/** Builds the full KB graph (articles + memory + inbox + tags) from the current content set. */
export function buildKbGraph(
  content: ContentItem[] = getAllContent()
): GraphData {
  const nodes: GraphNode[] = [];
  const edgeKeys = new Set<string>();
  const edges: GraphEdge[] = [];

  // Resolution map: slug | title/name | aliases → node id
  const resolve = new Map<string, string>();

  for (const item of content) {
    resolve.set(item.slug, item.slug);
    resolve.set(slugify(item.slug), item.slug);
    if (isArticle(item)) {
      resolve.set(slugify(item.title), item.slug);
    } else if (isMemory(item)) {
      resolve.set(slugify(item.title), item.slug);
      resolve.set(slugify(item.name), item.slug);
      for (const alias of item.aliases) resolve.set(slugify(alias), item.slug);
    } else if (isInbox(item)) {
      resolve.set(slugify(item.title), item.slug);
    }
  }

  for (const item of content) {
    if (isArticle(item)) {
      nodes.push({
        id: item.slug,
        label: item.title,
        kind: "article",
        href: `/k/${item.slug}`,
        tags: item.tags,
        description: item.summary,
        updated: item.updated,
      });
    } else if (isMemory(item)) {
      nodes.push({
        id: item.slug,
        label: item.title,
        kind: "memory",
        memoryType: item.memoryType,
        href: `/m/${item.slug}`,
        tags: item.tags,
        description: item.description,
        updated: item.updated,
      });
    } else if (isInbox(item)) {
      nodes.push({
        id: item.slug,
        label: item.title,
        kind: "inbox",
        href: `/d/${item.slug}`,
        tags: [],
        description: "",
        updated: item.date,
      });
    }
  }

  const addEdge = (
    source: string,
    target: string,
    kind: "link" | "tag"
  ): void => {
    if (source === target) return;
    const key = `${kind}|${source}|${target}`;
    if (edgeKeys.has(key)) return;
    edgeKeys.add(key);
    edges.push({ source, target, kind });
  };

  // Link edges: frontmatter links/related + body wikilinks, resolved and directed source→target.
  for (const item of content) {
    let refs: string[] = [];
    if (isArticle(item)) refs = [...item.links, ...extractWikilinks(item.raw)];
    else if (isMemory(item))
      refs = [...item.related, ...extractWikilinks(item.raw)];
    else if (isInbox(item))
      refs = [...item.links, ...extractWikilinks(item.raw)];

    for (const ref of refs) {
      const target = resolve.get(slugify(ref));
      if (!target) continue;
      addEdge(item.slug, target, "link");
    }
  }

  // Tag nodes + membership edges.
  const tagNodes = new Map<string, GraphNode>();
  for (const item of content) {
    const tags = isInbox(item) ? [] : item.tags;
    for (const tag of tags) {
      const tagId = `#${tag}`;
      if (!tagNodes.has(tagId)) {
        tagNodes.set(tagId, {
          id: tagId,
          label: `#${tag}`,
          kind: "tag",
          href: "",
          tags: [],
          description: "",
          updated: "",
        });
      }
      addEdge(item.slug, tagId, "tag");
    }
  }

  return {
    generated: new Date().toISOString(),
    nodes: [...nodes, ...tagNodes.values()],
    edges,
  };
}
