"use client";

import type { TOCItem } from "@duyet/libs/extractHeadings";
import { cn } from "@duyet/libs/utils";
import { useState } from "react";

import { MobileTOCButton } from "./MobileTOCButton";

interface PostHeaderProps {
  title: string;
  headings?: TOCItem[];
  children?: React.ReactNode;
}

/**
 * Post header with mobile-friendly TOC toggle button.
 * Displays the title and a "Contents" button with heading count badge.
 */
export function PostHeader({
  title,
  headings = [],
  children,
}: PostHeaderProps) {
  const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);

  return (
    <header className="mb-8 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <h1
          className={cn(
            "mt-2 inline-block break-words py-2",
            "font-serif text-neutral-900 dark:text-neutral-100",
            "text-3xl font-bold tracking-normal",
            "md:text-4xl md:tracking-tight",
            "lg:text-5xl lg:tracking-tight",
            "flex-1"
          )}
        >
          {title}
        </h1>

        {/* Mobile TOC Button - Only show on mobile/tablet */}
        <div className="lg:hidden flex-shrink-0">
          <MobileTOCButton
            headings={headings}
            isOpen={isMobileTocOpen}
            onOpenChange={setIsMobileTocOpen}
          />
        </div>
      </div>

      {children}
    </header>
  );
}
