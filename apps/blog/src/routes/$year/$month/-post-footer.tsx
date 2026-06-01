import type { Post, Series } from "@duyet/interfaces";
import { Link } from "@tanstack/react-router";
import { yearColor } from "@/lib/colors";
import type { LoadedPost } from "./-types";

function postParams(post: Post) {
  const [, year, month, slug] = post.slug.split("/");
  return { year, month, slug };
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
  const count = (series ? 1 : 0) + (related.length > 0 ? 1 : 0) + (hasChangelog ? 1 : 0);

  if (count === 0) {
    return null;
  }

  // Match the track count to the number of sections so two columns fill 50/50
  // instead of leaving an empty third track. Full literal strings keep Tailwind
  // from purging dynamically-built class names.
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
        {series && (
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
            <div className="rd-rows">
              {series.posts.map((sPost, i) => {
                const isCurrent = sPost.slug === post.slug;
                return (
                  <Link
                    key={sPost.slug}
                    to="/$year/$month/$slug/"
                    params={postParams(sPost)}
                    className={`rd-row cursor-pointer no-underline px-2 text-inherit${isCurrent ? " bg-[var(--rd-surface-2)]" : ""}`}
                    style={{ gridTemplateColumns: "auto 1fr" }}
                  >
                    <span className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-base leading-none tabular-nums w-[28px]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="truncate">
                      <span className={`font-[550] text-[clamp(14px,1.4vw,16px)] tracking-tight${isCurrent ? " text-[var(--rd-accent)]" : ""}`}>
                        {sPost.title}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Related */}
        {related.length > 0 && (
          <div>
            <p className="font-[var(--font-mono)] text-xl font-semibold tracking-tight text-[var(--rd-text)] mb-4">Related</p>
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
