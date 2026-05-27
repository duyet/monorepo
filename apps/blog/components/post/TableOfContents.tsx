"use client";

import type { TOCItem } from "@duyet/libs/extractHeadings";
import { cn } from "@duyet/libs/utils";
import { List } from "lucide-react";
import { useEffect, useState } from "react";

interface TableOfContentsProps {
  headings?: TOCItem[];
}

export function TableOfContents({
  headings: initialHeadings = [],
}: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollable = documentHeight - windowHeight;
      setProgress(
        scrollable <= 0
          ? 0
          : Math.min(Math.max((scrollTop / scrollable) * 100, 0), 100),
      );
    };

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (initialHeadings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-80px 0px -80% 0px", threshold: 0 },
    );
    for (const { id } of initialHeadings) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [initialHeadings]);

  if (initialHeadings.length === 0) return null;

  const handleLinkClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setActiveId(id);
  };

  return (
    <div className="text-sm">
      <div className="mb-4 flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
        <List className="h-3.5 w-3.5" />
        On this page
      </div>

      <div className="relative pl-4">
        <div className="absolute left-0 top-0 bottom-0 w-px bg-border">
          <div
            className="absolute left-0 top-0 w-px bg-foreground transition-all duration-150 ease-out"
            style={{ height: `${progress}%` }}
          />
        </div>

        <ul className="space-y-1">
          {initialHeadings.map((heading) => (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                onClick={(e) => handleLinkClick(e, heading.id)}
                className={cn(
                  "block py-1 leading-snug transition-colors",
                  heading.level === 3 && "pl-3 text-xs",
                  heading.level === 4 && "pl-6 text-xs",
                  activeId === heading.id
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
