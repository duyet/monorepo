"use client";

import { cn } from "@duyet/libs/utils";
import { useEffect, useState } from "react";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const extractHeadings = () => {
      const article = document.querySelector("article");
      if (!article) return;

      const elements = article.querySelectorAll("h1, h2, h3");
      const items: TOCItem[] = [];
      let isFirstH1 = true;

      elements.forEach((element) => {
        const text = element.textContent || "";
        if (!text.trim()) return; // Skip empty headings

        // Skip the first h1 (page title)
        if (element.tagName === "H1" && isFirstH1) {
          isFirstH1 = false;
          return;
        }

        // Generate ID if not present
        let id = element.id;
        if (!id) {
          id = text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
          element.id = id;
        }

        const level = element.tagName === "H1" ? 1 : element.tagName === "H2" ? 2 : 3;
        items.push({
          id,
          text: text.trim(),
          level,
        });
      });

      setHeadings(items);
    };

    // Initial extraction with delay for MDX to render
    const timeoutId = setTimeout(extractHeadings, 100);

    // Also observe for dynamic content changes
    const observer = new MutationObserver(() => {
      extractHeadings();
    });

    const article = document.querySelector("article");
    if (article) {
      observer.observe(article, {
        childList: true,
        subtree: true
      });
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
      {
        rootMargin: "-80px 0px -80% 0px",
        threshold: 0,
      }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav
      className={cn(
        // Hidden on small screens, visible on 2xl+ (1536px)
        "hidden 2xl:block",
        // Fixed position on right side
        "fixed top-24 right-8 w-56",
        // Ensure it doesn't overlap content
        "max-h-[calc(100vh-8rem)] overflow-y-auto",
        // Subtle styling
        "text-sm"
      )}
    >
      <div className="flex items-center gap-2 mb-4 font-medium text-gray-500 dark:text-gray-400">
        <svg
          className="w-4 h-4"
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
        On this page
      </div>

      <ul className="space-y-1 border-l border-gray-200 dark:border-gray-800">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById(heading.id);
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                  setActiveId(heading.id);
                }
              }}
              className={cn(
                "block py-1.5 border-l-2 -ml-px transition-all duration-200",
                heading.level === 1 && "pl-3 font-semibold",
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
    </nav>
  );
}
