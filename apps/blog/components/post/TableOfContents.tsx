"use client";

import { cn } from "@duyet/libs/utils";
import { useEffect, useState } from "react";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

// TOC Icon SVG
const TOCIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6h16M4 12h16M4 18h7"
    />
  </svg>
);

export function TableOfContents() {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopVisible, setIsDesktopVisible] = useState(true);

  useEffect(() => {
    const extractHeadings = () => {
      const article = document.querySelector("article");
      if (!article) return;

      const elements = article.querySelectorAll("h1, h2, h3");
      const items: TOCItem[] = [];
      let isFirstH1 = true;

      elements.forEach((element) => {
        const text = element.textContent || "";
        if (!text.trim()) return;

        if (element.tagName === "H1" && isFirstH1) {
          isFirstH1 = false;
          return;
        }

        let id = element.id;
        if (!id) {
          id = text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
          element.id = id;
        }

        const level =
          element.tagName === "H1" ? 1 : element.tagName === "H2" ? 2 : 3;
        items.push({ id, text: text.trim(), level });
      });

      setHeadings(items);
    };

    const timeoutId = setTimeout(extractHeadings, 100);
    const observer = new MutationObserver(() => extractHeadings());

    const article = document.querySelector("article");
    if (article) {
      observer.observe(article, { childList: true, subtree: true });
    }

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0px -80% 0px", threshold: 0 }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  if (headings.length === 0) {
    return null;
  }

  const handleLinkClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveId(id);
      setIsMobileOpen(false);
    }
  };

  const TOCContent = ({ showHeader = true }: { showHeader?: boolean }) => (
    <>
      {showHeader && (
        <div className="flex items-center gap-2 mb-4 font-medium text-gray-500 dark:text-gray-400">
          <TOCIcon className="w-4 h-4" />
          On this page
        </div>
      )}

      <ul className="space-y-1 border-l border-gray-200 dark:border-gray-800">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              onClick={(e) => handleLinkClick(e, heading.id)}
              className={cn(
                "block py-1.5 border-l-2 -ml-px transition-all duration-200",
                heading.level === 1 && "pl-3",
                heading.level === 2 && "pl-4",
                heading.level === 3 && "pl-6 text-xs",
                activeId === heading.id
                  ? "border-blue-500 text-blue-600 dark:text-blue-400 font-medium"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600"
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </>
  );

  return (
    <>
      {/* Mobile/Tablet: Floating toggle button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className={cn(
          "xl:hidden",
          "fixed bottom-6 right-6 z-40",
          "w-12 h-12 rounded-full",
          "bg-white dark:bg-gray-800",
          "shadow-lg border border-gray-200 dark:border-gray-700",
          "flex items-center justify-center",
          "hover:bg-gray-50 dark:hover:bg-gray-700",
          "transition-all duration-200",
          "hover:scale-105 active:scale-95"
        )}
        aria-label={
          isMobileOpen ? "Close table of contents" : "Open table of contents"
        }
      >
        <TOCIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>

      {/* Mobile/Tablet: Slide-out panel (no backdrop, doesn't block content) */}
      <nav
        className={cn(
          "xl:hidden",
          "fixed top-20 right-0 z-30",
          "w-72 max-w-[80vw]",
          "bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm",
          "shadow-xl border-l border-gray-200 dark:border-gray-700",
          "p-4 pt-4",
          "max-h-[70vh] overflow-y-auto",
          "text-sm rounded-l-xl",
          "transition-transform duration-300 ease-out",
          isMobileOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <TOCContent />
      </nav>

      {/* Desktop: Toggle button on right side */}
      <button
        onClick={() => setIsDesktopVisible(!isDesktopVisible)}
        className={cn(
          "hidden xl:flex",
          "fixed top-24 right-4 z-40",
          "w-10 h-10 rounded-full",
          "items-center justify-center",
          "bg-white dark:bg-gray-800",
          "shadow-lg border border-gray-200 dark:border-gray-700",
          "hover:bg-gray-50 dark:hover:bg-gray-700",
          "transition-all duration-300"
        )}
        aria-label={
          isDesktopVisible ? "Hide table of contents" : "Show table of contents"
        }
      >
        <TOCIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>

      {/* Desktop: Fixed sidebar */}
      <nav
        className={cn(
          "hidden xl:block",
          "fixed top-24 right-8 w-56",
          "max-h-[calc(100vh-8rem)] overflow-y-auto",
          "text-sm",
          "transition-all duration-300",
          isDesktopVisible
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-8 pointer-events-none"
        )}
      >
        <TOCContent />
      </nav>
    </>
  );
}
