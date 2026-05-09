"use client";

import { cn } from "@duyet/libs/utils";

interface MarginNoteProps {
  children: React.ReactNode;
  label?: string;
  className?: string;
}

/**
 * MarginNote - Side note for additional context
 * Desktop: appears in margin, Mobile: inline expandable
 * Inspired by Tufte's margin notes
 */
export function MarginNote({
  children,
  label,
  className = "",
}: MarginNoteProps) {
  return (
    <span
      className={cn(
        "noted inline align-middle",
        "lg:relative",
        className
      )}
    >
      <span className="noted-label text-[var(--primary)] text-xs font-medium">
        {label || "Note"}
      </span>
      <span className="noted-content hidden lg:inline-block ml-2 text-sm text-[var(--muted)] border-l-2 border-[var(--primary)]/30 pl-2">
        {children}
      </span>
    </span>
  );
}

interface MarginBlockProps {
  children: React.ReactNode;
  position?: "left" | "right";
  className?: string;
}

/**
 * MarginBlock - Full block that can be positioned in margin
 * Useful for longer notes, definitions, or asides
 */
export function MarginBlock({
  children,
  position = "right",
  className = "",
}: MarginBlockProps) {
  return (
    <aside
      className={cn(
        "my-6 p-4 rounded-lg bg-[var(--surface-soft)] border border-[var(--hairline)] text-sm text-[var(--muted)]",
        position === "right" && "lg:ml-auto lg:max-w-xs",
        position === "left" && "lg:mr-auto lg:max-w-xs",
        className
      )}
    >
      {children}
    </aside>
  );
}

/**
 * InlineNote - Highlighted inline note for quick context
 * Good for brief definitions or parenthetical remarks
 */
export function InlineNote({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block px-2 py-0.5 text-sm rounded bg-[var(--surface-card)] text-[var(--muted)] border border-[var(--hairline)]",
        className
      )}
    >
      {children}
    </span>
  );
}

export default MarginNote;
