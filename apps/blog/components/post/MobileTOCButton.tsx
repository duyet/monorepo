"use client";

import type { TOCItem } from "@duyet/libs/extractHeadings";
import { cn } from "@duyet/libs/utils";
import { useState } from "react";

// TOC Icon SVG
const TOCIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6h16M4 12h16M4 18h7"
    />
  </svg>
);

// Close Icon SVG
const CloseIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

interface MobileTOCButtonProps {
  /** Pre-extracted headings from build time for static rendering */
  headings?: TOCItem[];
  /** Callback when TOC state changes */
  onOpenChange?: (isOpen: boolean) => void;
  /** Whether TOC panel is currently open */
  isOpen?: boolean;
}

/**
 * Mobile-friendly Table of Contents toggle button.
 * Displays a prominent "Contents" button with badge showing heading count.
 */
export function MobileTOCButton({
  headings = [],
  onOpenChange,
  isOpen = false,
}: MobileTOCButtonProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = onOpenChange !== undefined;
  const isMobileOpen = isControlled ? isOpen : internalOpen;

  const handleToggle = () => {
    const newState = !isMobileOpen;
    if (isControlled) {
      onOpenChange(newState);
    } else {
      setInternalOpen(newState);
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <>
      {/* Mobile TOC Toggle Button - Placed in header */}
      <button
        onClick={handleToggle}
        className={cn(
          "lg:hidden",
          "inline-flex items-center gap-2",
          "px-3 py-1.5 rounded-lg",
          "bg-[#f7f7f7] dark:bg-[#1a1a1a]",
          "hover:bg-[#1a1a1a]/10 dark:hover:bg-[#1a1a1a]/80",
          "text-sm font-medium",
          "text-[#1a1a1a]/70 dark:text-[#f8f8f2]/70",
          "transition-all duration-200",
          "active:scale-95",
          "border border-[#1a1a1a]/10 dark:border-white/10"
        )}
        aria-label={
          isMobileOpen ? "Close table of contents" : "Open table of contents"
        }
        aria-expanded={isMobileOpen}
      >
        {isMobileOpen ? (
          <>
            <CloseIcon className="w-4 h-4" />
            <span>Close</span>
          </>
        ) : (
          <>
            <TOCIcon className="w-4 h-4" />
            <span>Contents</span>
            <span
              className={cn(
                "px-1.5 py-0.5 rounded-full",
                "bg-blue-500 text-white",
                "text-xs font-semibold",
                "ml-0.5"
              )}
            >
              {headings.length}
            </span>
          </>
        )}
      </button>
    </>
  );
}
