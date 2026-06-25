import type { TOCItem } from "@duyet/libs/extractHeadings";
import { List, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const TOC_TOP = 96; // matches `top-24` (6rem)
const TOC_GAP = 24; // breathing room before the TOC yields to the footer

export function TableOfContents({ headings }: { headings: TOCItem[] }) {
  const [activeId, setActiveId] = useState<string>("");
  const [hidden, setHidden] = useState(false);
  const [isOverlapping, setIsOverlapping] = useState(false);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [isSidebarDismissed, setIsSidebarDismissed] = useState(false);
  const asideRef = useRef<HTMLElement>(null);

  // Auto-open overlay when sidebar is dismissed, hidden, or overlapping
  useEffect(() => {
    const shouldOpenOverlay = isSidebarDismissed || hidden || isOverlapping;
    setIsOverlayOpen(shouldOpenOverlay);
  }, [isSidebarDismissed, hidden, isOverlapping]);

  useEffect(() => {
    const ids = headings.map((h) => h.id);
    if (ids.length === 0) return;

    // Scroll-spy: the active section is the last heading scrolled past (the
    // nearest one whose top is above a small offset under the fixed header).
    // This keeps a section highlighted while reading its body, not only while
    // a heading crosses a band.
    const onScroll = () => {
      const offset = 120;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= offset) {
          current = id;
        } else {
          break;
        }
      }
      setActiveId(current);

      // Hide the floating TOC once the footer (series/related/changelog)
      // scrolls up into the vertical band the fixed TOC occupies, so the two
      // never visually collide.
      const footer = document.getElementById("post-footer");
      if (footer) {
        const tocBottom = TOC_TOP + (asideRef.current?.offsetHeight ?? 0);
        setHidden(footer.getBoundingClientRect().top <= tocBottom + TOC_GAP);
      }
    };

    const checkOverlap = () => {
      const prose = document.querySelector(".prose");
      if (!prose) return;

      const children = Array.from(prose.children);
      let maxRight = 0;
      for (const child of children) {
        if (
          child.tagName === "ASIDE" ||
          child.classList.contains("toc-aside")
        ) continue;

        const rect = child.getBoundingClientRect();
        if (rect.width > 0 && rect.right > maxRight) {
          maxRight = rect.right;
        }
      }

      const sidebarWidth = 220;
      const sidebarMargin = 24;
      const gap = 24; // buffer gap
      const overlapLimit = window.innerWidth - sidebarWidth - sidebarMargin - gap;

      const overlaps = maxRight > overlapLimit || window.innerWidth < 1280;
      setIsOverlapping(overlaps);
    };

    onScroll();
    checkOverlap();

    window.addEventListener("scroll", onScroll, { passive: true });
    
    const handleResize = () => {
      onScroll();
      checkOverlap();
    };
    
    window.addEventListener("resize", handleResize);

    const observer = new MutationObserver(checkOverlap);
    const prose = document.querySelector(".prose");
    if (prose) {
      observer.observe(prose, { childList: true, subtree: true });
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
    };
  }, [headings]);

  if (headings.length === 0) return null;

  const showSidebar = !isSidebarDismissed && !isOverlapping && !hidden;
  const showFloatingButton = isSidebarDismissed || isOverlapping || hidden;

  const tocBgStyle = {
    background: "color-mix(in srgb, var(--background) 90%, transparent)",
    backdropFilter: "blur(12px)",
  };

  const handleLinkClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setActiveId(id);
    setIsOverlayOpen(false);
  };

  return (
    <>
      {/* Desktop fixed sidebar TOC (shown on wide screens without overlap) */}
      {showSidebar && (
        <aside
          ref={asideRef}
          style={tocBgStyle}
          className="toc-aside hidden xl:block fixed right-6 top-24 w-[220px] rounded-xl border border-[var(--rd-border)] p-4 shadow-sm transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-3 border-b border-[var(--rd-border)] pb-2">
            <p className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[11px] uppercase tracking-[0.06em] flex items-center gap-1.5">
              <List className="h-3.5 w-3.5" />
              On this page
            </p>
            <button
              onClick={() => setIsSidebarDismissed(true)}
              className="rounded p-1 hover:bg-[var(--rd-border)]/20 text-[var(--rd-text-3)] hover:text-[var(--rd-text)] transition-colors"
              title="Dismiss TOC sidebar"
              aria-label="Dismiss TOC sidebar"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <nav className="flex flex-col gap-1.5 border-l border-[var(--rd-border)]">
            {headings.map((h) => (
              <a
                key={h.id}
                href={`#${h.id}`}
                onClick={(e) => handleLinkClick(e, h.id)}
                className={`block text-[13px] leading-snug no-underline transition-colors truncate pl-3 -ml-px ${
                  h.level === 3 ? "pl-6" : ""
                } ${
                  activeId === h.id
                    ? "text-[var(--rd-text)] border-l-2 border-[var(--rd-accent)] font-medium"
                    : "text-[var(--rd-text-3)] hover:text-[var(--rd-text)]"
                }`}
              >
                {h.text}
              </a>
            ))}
          </nav>
        </aside>
      )}

      {/* Floating Toggle Button and Overlay Panel (shown when sidebar is hidden/dismissed or overlaps) */}
      {showFloatingButton && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
          {/* Floating TOC Card Overlay */}
          {isOverlayOpen && (
            <div
              style={tocBgStyle}
              className="mb-2 w-72 max-h-[70vh] overflow-y-auto rounded-xl border border-[var(--rd-border)] p-4 shadow-xl animate-in fade-in slide-in-from-bottom-5 duration-200"
            >
              <div className="flex items-center justify-between mb-4 border-b border-[var(--rd-border)] pb-2">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[var(--rd-text-3)]">
                  <List className="h-3.5 w-3.5" />
                  On this page
                </div>
                <button
                  onClick={() => setIsOverlayOpen(false)}
                  className="rounded p-1 hover:bg-[var(--rd-border)]/20 text-[var(--rd-text-3)] hover:text-[var(--rd-text)] transition-colors"
                  aria-label="Close table of contents"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <nav className="flex flex-col gap-1.5 border-l border-[var(--rd-border)]">
                {headings.map((h) => (
                  <a
                    key={h.id}
                    href={`#${h.id}`}
                    onClick={(e) => handleLinkClick(e, h.id)}
                    className={`block text-[13px] leading-snug no-underline transition-colors truncate pl-3 -ml-px ${
                      h.level === 3 ? "pl-6" : ""
                    } ${
                      activeId === h.id
                        ? "text-[var(--rd-text)] border-l-2 border-[var(--rd-accent)] font-medium"
                        : "text-[var(--rd-text-3)] hover:text-[var(--rd-text)]"
                    }`}
                  >
                    {h.text}
                  </a>
                ))}
              </nav>
            </div>
          )}

          {/* Floating Action Button */}
          <button
            onClick={() => setIsOverlayOpen(!isOverlayOpen)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--rd-text)] text-[var(--background)] shadow-lg hover:scale-105 active:scale-95 transition-transform border border-[var(--rd-border)]"
            aria-label="Toggle Table of Contents"
          >
            {isOverlayOpen ? <X className="h-5 w-5" /> : <List className="h-5 w-5" />}
          </button>
        </div>
      )}
    </>
  );
}
