import { ChevronDown, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import type { ChildNavItem } from "@/lib/posts";

export function ChildBreadcrumb({
  parentTitle,
  parentSlug,
  currentTitle,
  siblings,
}: {
  parentTitle: string;
  parentSlug: string;
  currentTitle: string;
  siblings: ChildNavItem[];
}) {
  const navigate = useNavigate();
  const segments = parentSlug.replace(/^\//, "").split("/");
  const [year, month, slug] = segments;
  const hasValidParent = Boolean(year && month && slug);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-10">
      <nav className="flex items-center gap-1.5 text-[13px] font-[var(--font-mono)] text-[var(--rd-text-3)] flex-wrap">
        {hasValidParent ? (
          <Link
            to="/$year/$month/$slug/"
            params={{ year, month, slug }}
            className="hover:text-[var(--rd-text)] transition-colors no-underline"
          >
            {parentTitle}
          </Link>
        ) : (
          <span>{parentTitle}</span>
        )}
        <ChevronRight size={13} className="text-[var(--rd-text-4)]" />
        {siblings.length > 0 ? (
          <span className="relative">
            <select
              value={currentTitle}
              onChange={(e) => {
                const sibling = siblings.find(
                  (s) => s.title === e.target.value
                );
                if (sibling) {
                  navigate({
                    to: "/$year/$month/$slug/$child/",
                    params: {
                      year: sibling.year,
                      month: sibling.month,
                      slug: sibling.parent,
                      child: sibling.child,
                    },
                  });
                }
              }}
              className="appearance-none bg-transparent text-[var(--rd-text-2)] pr-5 pl-1 py-0.5 rounded border border-[var(--rd-border)] hover:border-[var(--rd-accent)] cursor-pointer text-[13px] outline-none max-w-[60vw]"
            >
              {siblings.map((s) => (
                <option key={s.child} value={s.title}>
                  {s.title}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--rd-text-4)]"
            />
          </span>
        ) : (
          <span className="text-[var(--rd-text-2)] truncate max-w-[60vw]">
            {currentTitle}
          </span>
        )}
      </nav>
    </div>
  );
}
