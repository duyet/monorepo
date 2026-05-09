"use client";

import { cn } from "@duyet/libs/utils";

export interface DiffLine {
  type: "added" | "removed" | "neutral" | "header";
  content: string;
  lineNumber?: number;
  annotation?: string;
}

interface AnnotatedDiffProps {
  lines: DiffLine[];
  language?: string;
  className?: string;
}

/**
 * AnnotatedDiff - Code diff with annotations for code review
 * Inspired by HTML effectiveness pattern for code review
 */
export function AnnotatedDiff({
  lines,
  language = "typescript",
  className = "",
}: AnnotatedDiffProps) {
  const lineStyles = {
    added: "bg-green-50/50 dark:bg-green-900/10 border-l-2 border-green-500",
    removed: "bg-red-50/50 dark:bg-red-900/10 border-l-2 border-red-500",
    neutral: "bg-transparent",
    header: "bg-[var(--surface-soft)] text-center text-sm text-[var(--muted)]",
  };

  return (
    <div
      className={cn(
        "my-6 rounded-lg border border-[var(--hairline)] overflow-hidden",
        className
      )}
    >
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--surface-soft)] border-b border-[var(--hairline)]">
        <span className="font-mono text-xs text-[var(--muted)]">{language}</span>
        <span className="text-xs text-[var(--muted)]">
          {lines.filter((l) => l.type === "added").length} additions,{" "}
          {lines.filter((l) => l.type === "removed").length} deletions
        </span>
      </div>
      <pre className="p-4 overflow-x-auto text-sm">
        <code className="font-mono">
          {lines.map((line, index) => (
            <div
              key={index}
              className={cn(
                "relative py-0.5 px-2 -mx-2",
                lineStyles[line.type]
              )}
            >
              <span className="inline-block w-8 text-right text-[var(--muted)] select-none mr-4">
                {line.lineNumber ?? ""}
              </span>
              <span
                className={cn(
                  "inline-block min-w-[1ch]",
                  line.type === "added" && "text-green-700 dark:text-green-400",
                  line.type === "removed" && "text-red-700 dark:text-red-400",
                  line.type === "neutral" && "text-[var(--body)]"
                )}
              >
                {line.type === "added" && "+"}
                {line.type === "removed" && "-"}
                {line.type === "neutral" && " "}
                {line.content}
              </span>
              {line.annotation && (
                <span className="block ml-12 mt-1 text-xs text-[var(--muted)] italic">
                  {line.annotation}
                </span>
              )}
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}

interface SideBySideDiffProps {
  before: string;
  after: string;
  language?: string;
  className?: string;
}

/**
 * SideBySideDiff - Side-by-side code comparison
 */
export function SideBySideDiff({
  before,
  after,
  className = "",
}: SideBySideDiffProps) {
  return (
    <div
      className={cn(
        "my-6 grid grid-cols-2 gap-4",
        "rounded-lg border border-[var(--hairline)] overflow-hidden",
        className
      )}
    >
      <div className="border-r border-[var(--hairline)]">
        <div className="px-4 py-2 bg-red-50/50 dark:bg-red-900/10 border-b border-[var(--hairline)]">
          <span className="font-mono text-xs text-red-700 dark:text-red-400">
            Before
          </span>
        </div>
        <pre className="p-4 overflow-x-auto text-sm">
          <code className="font-mono text-[var(--body)]">{before}</code>
        </pre>
      </div>
      <div>
        <div className="px-4 py-2 bg-green-50/50 dark:bg-green-900/10 border-b border-[var(--hairline)]">
          <span className="font-mono text-xs text-green-700 dark:text-green-400">
            After
          </span>
        </div>
        <pre className="p-4 overflow-x-auto text-sm">
          <code className="font-mono text-[var(--body)]">{after}</code>
        </pre>
      </div>
    </div>
  );
}

export default AnnotatedDiff;
