"use client";

import type { Post } from "@duyet/interfaces";
import type { TOCItem } from "@duyet/libs/extractHeadings";
import { useEffect, useState } from "react";

import { PostHeader } from "./PostHeader";
import { TableOfContents } from "./TableOfContents";

interface PostWithTOCProps {
  post: Post & { headings?: TOCItem[] };
  children: React.ReactNode;
  afterContent?: React.ReactNode;
}

/**
 * Wrapper component that coordinates TOC state between header button and TOC panel.
 * Ensures smooth scrolling and consistent state across mobile and desktop.
 */
export function PostWithTOC({
  post,
  children,
  afterContent,
}: PostWithTOCProps) {
  const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);
  const headings = post.headings || [];

  // Close mobile TOC when navigating away
  useEffect(() => {
    const handleRouteChange = () => setIsMobileTocOpen(false);
    window.addEventListener("popstate", handleRouteChange);
    return () => window.removeEventListener("popstate", handleRouteChange);
  }, [setIsMobileTocOpen]);

  return (
    <div className="relative">
      {/* Main content */}
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <article>
          <PostHeader title={post.title} headings={headings}>
            {children}
          </PostHeader>
          {afterContent}
        </article>
      </div>

      {/* Table of Contents - controlled state */}
      <TableOfContents
        headings={headings}
        isMobileOpen={isMobileTocOpen}
        onMobileOpenChange={setIsMobileTocOpen}
      />
    </div>
  );
}
