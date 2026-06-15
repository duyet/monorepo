import type { Post } from "@duyet/interfaces";
import { formatReadingTime } from "@duyet/libs/date";
import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

/**
 * Chapters list shown on a parent post or child post: an ordered set of
 * sibling chapters. Mirrors the `rd-rows` styling used by the series detail
 * page, but each row links to the child's nested URL
 * (/<year>/<month>/<slug>/<child>).
 *
 * When `currentSlug` is provided the matching row is visually highlighted to
 * indicate the reader's current position.
 */
export function Chapters({
  chapters,
  parentSlug,
  currentSlug,
}: {
  chapters: Post[];
  parentSlug: string;
  currentSlug?: string;
}) {
  if (chapters.length === 0) return null;

  // parentSlug e.g. "/2026/01/coding-agent"
  const segments = parentSlug.replace(/^\//, "").split("/");
  const [year, month, slug] = segments;
  const hasValidParent = Boolean(year && month && slug);

  if (!hasValidParent) return null;

  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 mt-16 mb-8">
      <p className="font-[var(--font-mono)] text-xl font-semibold tracking-tight text-[var(--rd-text)] mb-4">
        Chapters
      </p>
      <div className="rd-rows">
        {chapters.map((child, i) => {
          // child.slug e.g. "/2026/01/coding-agent/claude-code"
          const childSeg = child.slug.split("/").pop() ?? "";
          const isCurrent = currentSlug === child.slug;
          return (
            <Link
              key={child.slug}
              to="/$year/$month/$slug/$child/"
              params={{ year, month, slug, child: childSeg }}
              className={`rd-row cursor-pointer no-underline text-inherit${isCurrent ? " bg-[var(--rd-surface-2)]" : ""}`}
              style={{ gridTemplateColumns: "auto 1fr auto" }}
            >
              <span className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-base leading-none tabular-nums w-[28px]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0">
                <span className={`font-[550] text-[clamp(14px,1.4vw,16px)] tracking-tight${isCurrent ? " text-[var(--rd-accent)]" : ""}`}>
                  {child.title}
                </span>
                {child.excerpt && (
                  <>
                    <span className="text-[var(--rd-text-3)] mx-1.5">—</span>
                    <span className="text-[var(--rd-text-2)] text-[13px]">
                      {child.excerpt}
                    </span>
                  </>
                )}
              </span>
              <span className="flex items-center gap-2 shrink-0 ml-2">
                {child.readingTime && (
                  <span className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[11px]">
                    {formatReadingTime(child.readingTime)}
                  </span>
                )}
                {!isCurrent && (
                  <ArrowRight
                    size={15}
                    className="text-[var(--rd-text-4)]"
                  />
                )}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
