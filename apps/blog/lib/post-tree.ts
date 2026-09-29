/**
 * Post-tree helpers shared by the post-footer and the series detail page.
 *
 * A chaptered post nests its chapters one level under the parent's URL
 * (`/2026/01/coding-agent/claude-code`), so "show this series / this post's
 * siblings" means the same grouping operation in both places. Keeping one
 * implementation means a child post cannot be rendered as a top-level entry on
 * one surface and as a nested one on another.
 */

import type { Post } from "@duyet/interfaces";

export type TreeNode = {
  post: Post;
  children: Post[];
};

/**
 * Group a flat post list into top-level posts plus their chapters.
 *
 * Posts with four or more path segments are chapters (`/yyyy/mm/parent/child`)
 * and are attached to their parent; everything else is a top-level entry.
 * Top-level posts come back oldest-first so the caller can number them.
 */
export function buildTree(posts: Post[]): TreeNode[] {
  const childrenByParent = new Map<string, Post[]>();
  const parents: Post[] = [];

  for (const post of posts) {
    const segments = post.slug.split("/").filter(Boolean);
    if (segments.length >= 4) {
      const parentSlug = `/${segments.slice(0, 3).join("/")}`;
      if (!childrenByParent.has(parentSlug)) {
        childrenByParent.set(parentSlug, []);
      }
      childrenByParent.get(parentSlug)!.push(post);
    } else {
      parents.push(post);
    }
  }

  parents.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return parents.map((post) => ({
    post,
    children: childrenByParent.get(post.slug) ?? [],
  }));
}
