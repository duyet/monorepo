import type { Post } from "@duyet/interfaces";
import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { yearColor } from "@/lib/colors";
import { CatChip } from "./CatChip";
import { postParams } from "./FeaturedPost";
import { Eyebrow } from "@duyet/components";

function PostList({
  filteredPosts,
  activeCategory,
  categories,
  setActiveCategory,
  totalPosts,
}: {
  filteredPosts: Post[];
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

      {/* Post rows */}
      <div className="rd-rows">
        {filteredPosts.map((post) => {
          const tokens = post.tokenCount || Math.round((post.readingTime ?? 1) * 200);
          const tokenLabel = tokens >= 1000
            ? `${(tokens / 1000).toFixed(1)}k`
            : tokens;
          return (
            <Link
              key={post.slug}
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
