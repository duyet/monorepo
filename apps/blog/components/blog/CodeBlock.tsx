"use client";

import { cn } from "@duyet/libs/utils";
import { Check, Copy } from "lucide-react";
import { useRef } from "react";
import { useClipboard } from "@/lib/hooks/useClipboard";

interface CodeBlockProps {
  children?: React.ReactNode;
  className?: string;
}

// Language label mapping for common languages
const LANGUAGE_LABELS: Record<string, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  tsx: "TSX",
  jsx: "JSX",
  python: "Python",
  rust: "Rust",
  go: "Go",
  java: "Java",
  cpp: "C++",
  c: "C",
  csharp: "C#",
  php: "PHP",
  ruby: "Ruby",
  swift: "Swift",
  kotlin: "Kotlin",
  scala: "Scala",
  html: "HTML",
  css: "CSS",
  scss: "SCSS",
  bash: "Bash",
  shell: "Shell",
  json: "JSON",
  yaml: "YAML",
  toml: "TOML",
  sql: "SQL",
  markdown: "Markdown",
  dockerfile: "Dockerfile",
  diff: "Diff",
  git: "Git",
};

function extractLanguage(className?: string): string | null {
  if (!className) return null;

  // Extract language from highlight.js class (e.g., "hljs language-javascript")
  const langMatch = className.match(/language-(\w+)/);
  if (langMatch) {
    const lang = langMatch[1];
    return (
      LANGUAGE_LABELS[lang] || lang.charAt(0).toUpperCase() + lang.slice(1)
    );
  }

  return null;
}

export function CodeBlock({ children, className, ...props }: CodeBlockProps) {
  const { copied, copy } = useClipboard();
  const preRef = useRef<HTMLPreElement>(null);
  const language = extractLanguage(className);

  const handleCopy = async () => {
    if (preRef.current) {
      await copy(preRef.current.textContent || "");
    }
  };

  return (
    <div className="relative group">
      {language && (
        <div
          className={cn(
            "absolute top-3 left-3",
            "px-2 py-0.5",
            "text-xs font-medium",
            "rounded-md",
            "bg-[#f7f7f7] dark:bg-[#1a1a1a]",
            "text-[#1a1a1a]/70 dark:text-[#f8f8f2]/55",
            "border border-[#1a1a1a]/10 dark:border-white/10",
            "select-none"
          )}
        >
          {language}
        </div>
      )}
      <pre
        ref={preRef}
        className={cn(
          "bg-white dark:bg-[#1a1a1a]/50",
          "border border-[#1a1a1a]/10 dark:border-white/10",
          "rounded-xl py-3 px-3 pr-12",
          "text-[#1a1a1a]/70 dark:text-[#f8f8f2]/70",
          "overflow-x-auto",
          "text-sm",
          language && "pt-10",
          className
        )}
        {...props}
      >
        {children}
      </pre>
      <button
        onClick={handleCopy}
        className={cn(
          "absolute top-3 right-3",
          "p-1.5",
          "rounded-md",
          "text-[#1a1a1a]/55 dark:text-[#f8f8f2]/55",
          "hover:text-[#1a1a1a]/70 dark:hover:text-[#f8f8f2]/70",
          "hover:bg-[#f7f7f7] dark:hover:bg-[#1a1a1a]",
          "transition-all duration-200",
          "opacity-0 group-hover:opacity-100",
          "focus:opacity-100"
        )}
        aria-label="Copy code"
        title="Copy code"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
