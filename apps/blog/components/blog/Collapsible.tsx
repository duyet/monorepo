"use client";

import { cn } from "@duyet/libs/utils";
import { ChevronDown } from "lucide-react";
import { useRef, useState } from "react";

export interface CollapsibleProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  variant?: "default" | "muted" | "accent";
}

/**
 * Collapsible section with smooth animation
 * Inspired by HTML effectiveness pattern for explainer content
 */
export function Collapsible({
  title,
  children,
  defaultOpen = false,
  className = "",
  variant = "default",
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">(
    defaultOpen ? "auto" : 0
  );

  const toggle = () => {
    if (isOpen) {
      setHeight(0);
      setTimeout(() => setIsOpen(false), 200);
    } else {
      setIsOpen(true);
      setHeight(contentRef.current?.scrollHeight ?? "auto");
    }
  };

  const variantStyles = {
    default: "bg-[var(--surface-card)] border-[var(--hairline)]",
    muted: "bg-[var(--background-secondary)] border-[var(--border-faint)]",
    accent: "bg-[var(--primary)]/5 border-[var(--primary)]/20",
  };

  return (
    <div
      className={cn(
        "rounded-lg border overflow-hidden transition-all",
        variantStyles[variant],
        className
      )}
    >
      <button
        onClick={toggle}
        className="w-full px-5 py-3 flex items-center justify-between text-left hover:bg-[var(--background-primary)]/50 transition-colors"
      >
        <span className="font-medium text-[var(--ink)] dark:text-[var(--on-dark)]">
          {title}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-[var(--muted)] transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <div
        ref={contentRef}
        className={cn(
          "overflow-hidden transition-all duration-200 ease-out",
          !isOpen && "hidden"
        )}
        style={{ height: isOpen ? height : 0 }}
      >
        <div className="px-5 pb-4 text-[var(--body)] dark:text-[var(--muted)] leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Collapsible;
