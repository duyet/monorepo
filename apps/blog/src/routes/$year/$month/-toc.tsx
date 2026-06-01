import type { TOCItem } from "@duyet/libs/extractHeadings";
import { useEffect, useRef, useState } from "react";

const TOC_TOP = 96; // matches `top-24` (6rem)
const TOC_GAP = 24; // breathing room before the TOC yields to the footer

export function TableOfContents({ headings }: { headings: TOCItem[] }) {
  const [activeId, setActiveId] = useState<string>("");
  const [hidden, setHidden] = useState(false);
  const asideRef = useRef<HTMLElement>(null);

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

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [headings]);

  return (
    <aside
      ref={asideRef}
      className={`hidden xl:block fixed right-6 top-24 w-[200px] transition-opacity duration-200 ${
        hidden ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <p className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[11px] uppercase tracking-[0.06em]">
        On this page
      </p>
      <nav className="mt-3 flex flex-col gap-1.5 border-l border-[var(--rd-border)]">
        {headings.map((h) => (
          <a
            key={h.id}
            href={`#${h.id}`}
            className={`block text-[13px] leading-snug no-underline transition-colors truncate pl-3 -ml-px ${
              h.level === 3 ? "pl-6" : ""
            } ${
              activeId === h.id
                ? "text-[var(--rd-text)] border-l-2 border-[var(--rd-accent)]"
                : "text-[var(--rd-text-3)] hover:text-[var(--rd-text)]"
            }`}
          >
            {h.text}
          </a>
        ))}
      </nav>
    </aside>
  );
}
