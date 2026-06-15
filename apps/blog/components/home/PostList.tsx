import type { Post } from "@duyet/interfaces";
import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { yearColor } from "@/lib/colors";
import { CatChip } from "./CatChip";
import { postParams } from "./FeaturedPost";
import { Eyebrow } from "@duyet/components";

function childParams(post: Post) {
  // child slug e.g. "/2026/01/coding-agent/claude-code"
  const parts = post.slug.replace(/^\//, "").split("/");
  return {
    year: parts[0],
    month: parts[1],
    slug: parts.slice(2, -1).join("/"),
    child: parts[parts.length - 1],
  };
}

function PostList({
  filteredPosts,
  childrenByParent,
  activeCategory,
  categories,
  setActiveCategory,
  totalPosts,
}: {
  filteredPosts: Post[];
  childrenByParent: Record<string, Post[]>;
  activeCategory: string;
  categories: { name: string; count: number }[];
  setActiveCategory: (cat: string) => void;
  totalPosts: number;
}) {
  return (
    <section
      id="latest"
      className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] py-[clamp(40px,5vw,64px)] pb-[clamp(56px,8vw,96px)]"
    >
      <div className="rd-sechead">
        <div>
          <Eyebrow>Latest</Eyebrow>
          <h2 className="rd-h-sec mt-3">
            Recent posts
          </h2>
        </div>
      </div>

      {/* Category filter chips */}
      <div
        className="flex gap-2 flex-wrap mb-[18px]"
      >
        <CatChip
          name="All"
          active={activeCategory === "All"}
          onClick={() => setActiveCategory("All")}
        />
        {categories.map((cat) => (
          <CatChip
            key={cat.name}
            name={cat.name}
            count={cat.count}
            active={activeCategory === cat.name}
            onClick={() => setActiveCategory(cat.name)}
          />
        ))}
      </div>

      {/* Post rows (with nested children tree) */}
      <div className="rd-rows">
        {filteredPosts.map((post) => {
          const tokens =
            post.tokenCount || Math.round((post.readingTime ?? 1) * 200);
          const tokenLabel = tokens >= 1000
            ? `${(tokens / 1000).toFixed(1)}k`
            : tokens;
          const children = childrenByParent[post.slug];
          return (
            <div key={post.slug} className="contents">
              <Link
                to="/$year/$month/$slug/"
                params={postParams(post)}
                className="rd-row cursor-pointer no-underline text-inherit"
                style={{ gridTemplateColumns: "auto 1fr auto" }}
              >
                <span
                  className="font-[var(--font-mono)] text-base font-bold leading-none shrink-0"
                  style={{ color: yearColor(new Date(post.date).getFullYear()) }}
                >
                  {new Date(post.date).getFullYear()}
                </span>
                <span className="truncate">
                  <span className="font-[550] text-[clamp(14px,1.4vw,16px)] tracking-tight">
                    {post.title}
                  </span>
                  {post.excerpt && (
                    <>
                      <span className="text-[var(--rd-text-3)] mx-1.5">—</span>
                      <span className="text-[var(--rd-text-2)] text-[13px]">{post.excerpt}</span>
                    </>
                  )}
                </span>
                <span className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="rd-tag-pill text-[10.5px] !py-[1px] !px-1.5">
                    {post.category}
                  </span>
                  <span className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[11px] w-[52px] text-right">
                    {tokenLabel} tok
                  </span>
                </span>
              </Link>

              {/* Nested children tree */}
              {children && children.length > 0 && (
                <div className="pl-4 sm:pl-6 ml-2 sm:ml-3 border-l border-[var(--rd-border)] flex flex-col">
                  {children.map((child) => (
                    <Link
                      key={child.slug}
                      to="/$year/$month/$slug/$child/"
                      params={childParams(child)}
                      className="group flex items-baseline gap-2 py-1 no-underline text-inherit cursor-pointer"
                    >
                      <span className="font-[var(--font-mono)] text-[11px] text-[var(--rd-text-4)] tabular-nums w-[22px] shrink-0">
                        ↳
                      </span>
                      <span className="truncate">
                        <span className="font-[520] text-[13.5px] tracking-tight text-[var(--rd-text)] group-hover:text-[var(--rd-accent)] transition-colors">
                          {child.title}
                        </span>
                        {child.excerpt && (
                          <>
                            <span className="text-[var(--rd-text-4)] mx-1.5">—</span>
                            <span className="text-[var(--rd-text-3)] text-[12px]">
                              {child.excerpt}
                            </span>
                          </>
                        )}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Archive link */}
      <Link
        to="/archives/"
        className="rd-btn rd-btn-ghost mt-[26px]"
      >
        See all {totalPosts} posts <ArrowRight size={16} />
      </Link>
    </section>
  );
}

export { PostList };
