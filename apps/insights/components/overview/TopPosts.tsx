/**
 * The "most-read pages" list: the five top PostHog paths as links into the
 * blog, each with a meter bar scaled against the single most-read post.
 *
 * Guarded on a non-empty list. The meter width is `(views / max) * 100` where
 * `max` is the first row's views, so the top post is always exactly 100% and
 * the bar is a share of the leader, not of the total.
 */
import { Eyebrow } from "@duyet/components";
import { formatNumber } from "./helpers";
import type { PostHogPath } from "./types";

function TopPosts({
  posts,
  blogUrl,
}: {
  posts: PostHogPath[];
  blogUrl: string;
}) {
  if (posts.length === 0) return null;

  return (
    <div
      id="ins-reading"
      className="rd-card p-[clamp(18px,2.2vw,26px)] mt-3 p-[clamp(22px,2.6vw,30px)]"
    >
      <div
        className="flex justify-between items-end mb-2"
      >
        <div>
          <Eyebrow>Reading · PostHog</Eyebrow>
          <h3
            className="text-[1.35rem] mt-[10px] tracking-[-0.03em]"
          >
            Most-read pages
          </h3>
        </div>
        <span className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-xs">
          unique visitors · 30d
        </span>
      </div>
      <div className="rd-rows">
        {posts.map((r, i) => {
          const max = posts[0].views;
          return (
            <a
              key={i}
              className="rd-row grid-cols-[auto_1fr_auto] no-underline text-inherit"
              href={`${blogUrl || "https://blog.duyet.net"}${r.path}`}
            >
              <span
                className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-xs w-[22px]"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0">
                <span
                  className="font-[var(--font-mono)] text-[13.5px] block truncate"
                >
                  {r.path}
                </span>
                <div
                  className="rd-meter mt-2 max-w-[360px]"
                >
                  <i
                    style={{
                      width: `${(r.views / max) * 100}%`,
                    }}
                  />
                </div>
              </span>
              <span
                className="font-[var(--font-mono)] text-sm font-semibold"
              >
                {formatNumber(r.visitors)}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

export { TopPosts };
