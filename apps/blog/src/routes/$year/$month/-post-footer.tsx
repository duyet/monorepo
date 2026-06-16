import type { Post, Series } from "@duyet/interfaces";
import { Link } from "@tanstack/react-router";
import { yearColor } from "@/lib/colors";
import type { LoadedPost } from "./-types";
import { useState } from "react";
import { cn } from "@duyet/libs/utils";

function postParams(post: Post) {
  const [, year, month, slug] = post.slug.split("/");
  return { year, month, slug };
}

function childParams(post: Post) {
  const segments = post.slug.replace(/^\//, "").split("/");
  return {
    year: segments[0],
    month: segments[1],
    slug: segments[2],
    child: segments[3],
  };
}

type TreeNode = {
  post: Post;
  children: Post[];
};

function buildTree(posts: Post[]): TreeNode[] {
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

export function PostFooter({
  post,
  series,
  related,
}: {
  post: LoadedPost;
  series: Series | null;
  related: Post[];
}) {
  const hasChangelog = Boolean(post.changelog && post.changelog.length > 0);
  const count =
    (series ? 1 : 0) + (related.length > 0 ? 1 : 0) + (hasChangelog ? 1 : 0);

  if (count === 0) {
    return null;
  }

  const gridCols =
    count >= 3
      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      : count === 2
        ? "grid-cols-1 md:grid-cols-2"
        : "grid-cols-1";

  return (
    <div
      id="post-footer"
      className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mt-16 mb-24"
    >
      <div className={`grid ${gridCols} gap-x-10 gap-y-12`}>
        {/* Changelog */}
        {hasChangelog && post.changelog && (
          <div>
            <p className="font-[var(--font-mono)] text-xl font-semibold tracking-tight text-[var(--rd-text)] mb-4">
              Changelog
            </p>
            <div className="border-t border-[var(--rd-border)]">
              {post.changelog.map((entry) => (
                <div
                  key={entry.date}
                  className="py-3 border-b border-[var(--rd-border)]"
                >
                  <span className="font-[var(--font-mono)] text-[12px] text-[var(--rd-text-3)] tabular-nums">
                    {entry.date}
                  </span>
                  <p className="text-[13.5px] text-[var(--rd-text-2)] leading-snug mt-1">
                    {entry.note}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Series */}
        {series && (() => {
          const tree = buildTree(series.posts);
          const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
            // Only expand the node containing the current page
            const initial = new Set<string>();
            for (const node of tree) {
              if (node.children.some(child => child.slug === post.slug)) {
                initial.add(node.post.slug);
                break;
              }
            }
            return initial;
          });

          const toggleNode = (slug: string) => {
            setExpandedNodes(prev => {
              const next = new Set(prev);
              if (next.has(slug)) {
                next.delete(slug);
              } else {
                next.add(slug);
              }
              return next;
            });
          };

          return (
            <div>
              <p className="font-[var(--font-mono)] text-xl font-semibold tracking-tight text-[var(--rd-text)] mb-4">
                <Link
                  to="/series/$slug/"
                  params={{ slug: series.slug }}
                  className="hover:text-[var(--rd-accent)] transition-colors no-underline text-inherit"
                >
                  Part of the series: {series.name}
                </Link>
              </p>
              <ul className="flex flex-col gap-1">
                {tree.map((node, i) => {
                  const isCurrentParent =
                    node.post.slug === post.slug ||
                    (!post.parent &&
                      node.post.slug === post.slug.replace(/\/$/, ""));
                  const hasChildren = node.children.length > 0;
                  const isExpanded = expandedNodes.has(node.post.slug);

                  return (
                    <li key={node.post.slug}>
                      <div className="flex items-center">
                        <Link
                          to="/$year/$month/$slug/"
                          params={postParams(node.post)}
                          className={cn(
                            "no-underline text-inherit flex items-center gap-2 rounded px-1.5 py-1 transition-colors flex-1",
                            isCurrentParent
                              ? "bg-[var(--rd-accent)]/10 text-[var(--rd-accent)] font-medium"
                              : "hover:bg-[var(--rd-surface-2)]"
                          )}
                        >
                          <span className="font-[var(--font-mono)] text-[13px] text-[var(--rd-text-3)] tabular-nums w-[22px] shrink-0">
                            {String(i + 1).padStart(2, "0")}.
                          </span>
                          <span className="text-[14px]">{node.post.title}</span>
                        </Link>
                        {hasChildren && (
                          <button
                            onClick={() => toggleNode(node.post.slug)}
                            className="ml-1 p-1 hover:bg-[var(--rd-surface-2)] rounded transition-colors text-[var(--rd-text-3)] hover:text-[var(--rd-text)]"
                            aria-label={isExpanded ? "Collapse" : "Expand"}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className={`transition-transform ${isExpanded ? "rotate-90" : ""}`}
                            >
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </button>
                        )}
                      </div>

                      {hasChildren && isExpanded && (
                        <ul className="ml-[14px] mt-0 flex flex-col gap-0 border-l border-[var(--rd-border)] pl-4">
                          {node.children.map((child) => {
                            const isCurrent = child.slug === post.slug;
                            return (
                              <li key={child.slug} className="relative">
                                <span className="absolute left-[-16px] top-[9px] w-2 h-[1px] bg-[var(--rd-border)]" />
                                <Link
                                  to="/$year/$month/$slug/$child/"
                                  params={childParams(child)}
                                  className={cn(
                                    "no-underline text-inherit flex items-center gap-2 rounded px-1.5 py-0.5 transition-colors",
                                    isCurrent
                                      ? "bg-[var(--rd-accent)]/10 text-[var(--rd-accent)] font-medium"
                                      : "hover:bg-[var(--rd-surface-2)] text-[var(--rd-text-2)]"
                                  )}
                                >
                                  <span className="text-[13.5px]">
                                    {child.title}
                                  </span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })()}

        {/* Related */}
        {related.length > 0 && (
          <div>
            <p className="font-[var(--font-mono)] text-xl font-semibold tracking-tight text-[var(--rd-text)] mb-4">
              Related
            </p>
            <div className="rd-rows">
              {related.map((relPost) => {
                const [, year, month, slug] = relPost.slug.split("/");
                const yr = new Date(relPost.date).getFullYear();
                return (
                  <Link
                    key={relPost.slug}
                    to="/$year/$month/$slug/"
                    params={{ year, month, slug }}
                    className="rd-row cursor-pointer no-underline text-inherit px-2"
                    style={{ gridTemplateColumns: "auto 1fr auto" }}
                  >
                    <span
                      className="font-[var(--font-mono)] text-base font-bold leading-none shrink-0"
                      style={{ color: yearColor(yr) }}
                    >
                      {yr}
                    </span>
                    <span className="truncate">
                      <span className="font-[550] text-[clamp(14px,1.4vw,16px)] tracking-tight">
                        {relPost.title}
                      </span>
                    </span>
                    <span className="rd-tag-pill text-[10.5px] !py-[1px] !px-1.5 shrink-0 ml-2">
                      {relPost.category}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
