import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { ChildNavItem } from "@/lib/posts";

/**
 * Child-page navigation: breadcrumb up to the parent + prev/next siblings.
 */
export function ChildBreadcrumb({
  parentTitle,
  parentSlug,
  currentTitle,
  prev,
  next,
}: {
  parentTitle: string;
  parentSlug: string;
  currentTitle: string;
  prev: ChildNavItem | null;
  next: ChildNavItem | null;
}) {
  // parentSlug e.g. "/2026/01/coding-agent"
  const [, year, month, slug] = parentSlug.split("/");

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[13px] font-[var(--font-mono)] text-[var(--rd-text-3)] flex-wrap">
        <Link
          to="/$year/$month/$slug/"
          params={{ year, month, slug }}
          className="hover:text-[var(--rd-text)] transition-colors no-underline"
        >
          {parentTitle}
        </Link>
        <ChevronRight size={13} className="text-[var(--rd-text-4)]" />
        <span className="text-[var(--rd-text-2)] truncate max-w-[60vw]">
          {currentTitle}
        </span>
      </nav>

      {/* Prev / next siblings */}
      {(prev || next) && (
        <div className="mt-6 grid grid-cols-2 gap-3">
          {prev ? (
            <Link
              to="/$year/$month/$slug/$child/"
              params={prev}
              className="group flex flex-col items-start gap-1 rounded-xl border border-[var(--rd-border)] p-3 no-underline hover:border-[var(--rd-accent)] transition-colors min-w-0"
            >
              <span className="flex items-center gap-1 text-[11px] font-[var(--font-mono)] uppercase tracking-wider text-[var(--rd-text-4)]">
                <ArrowLeft size={12} /> Previous
              </span>
              <span className="text-[14px] font-[550] tracking-tight text-[var(--rd-text)] truncate w-full">
                {prev.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              to="/$year/$month/$slug/$child/"
              params={next}
              className="group flex flex-col items-end gap-1 rounded-xl border border-[var(--rd-border)] p-3 no-underline hover:border-[var(--rd-accent)] transition-colors min-w-0"
            >
              <span className="flex items-center gap-1 text-[11px] font-[var(--font-mono)] uppercase tracking-wider text-[var(--rd-text-4)]">
                Next <ArrowRight size={12} />
              </span>
              <span className="text-[14px] font-[550] tracking-tight text-[var(--rd-text)] truncate w-full text-right">
                {next.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </div>
  );
}
