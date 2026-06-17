import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
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
          <SiblingDropdown currentTitle={currentTitle} siblings={siblings} />
        ) : (
          <span className="text-[var(--rd-text-2)] truncate max-w-[60vw]">
            {currentTitle}
          </span>
        )}
      </nav>
    </div>
  );
}

function SiblingDropdown({
  currentTitle,
  siblings,
}: {
  currentTitle: string;
  siblings: ChildNavItem[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`group inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 -mx-0.5 transition-colors cursor-pointer outline-none ${
          open
            ? "bg-[var(--rd-surface-2)] text-[var(--rd-text)]"
            : "text-[var(--rd-text-2)] hover:bg-[var(--rd-surface-2)] hover:text-[var(--rd-text)]"
        }`}
      >
        <span className="truncate max-w-[60vw]">{currentTitle}</span>
        <ChevronDown
          size={12}
          className={`shrink-0 text-[var(--rd-text-4)] transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-[calc(100%+6px)] z-20 min-w-full w-max max-w-[80vw] max-h-[60vh] overflow-y-auto rounded-lg border border-[var(--rd-border-2)] bg-[var(--rd-surface)] py-1"
        >
          {siblings.map((s) => {
            const isCurrent = s.title === currentTitle;
            return (
              <Link
                key={s.child}
                to="/$year/$month/$slug/$child/"
                params={{
                  year: s.year,
                  month: s.month,
                  slug: s.parent,
                  child: s.child,
                }}
                role="option"
                aria-selected={isCurrent}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2 px-3 py-1.5 no-underline transition-colors ${
                  isCurrent
                    ? "text-[var(--rd-accent)]"
                    : "text-[var(--rd-text-2)] hover:bg-[var(--rd-surface-2)] hover:text-[var(--rd-text)]"
                }`}
              >
                <Check
                  size={13}
                  className={`shrink-0 ${isCurrent ? "opacity-100" : "opacity-0"}`}
                />
                <span className="whitespace-nowrap">{s.title}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
