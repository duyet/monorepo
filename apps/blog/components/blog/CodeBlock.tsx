"use client";

import { cn } from "@duyet/libs/utils";
import { Check, Copy } from "lucide-react";
import { useRef, useState } from "react";

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
    return LANGUAGE_LABELS[lang] || lang.charAt(0).toUpperCase() + lang.slice(1);
  }

  return null;
}

export function CodeBlock({ children, className, ...props }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);
  const language = extractLanguage(className);

  const handleCopy = async () => {
    if (preRef.current) {
      const code = preRef.current.textContent || "";
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
            "bg-gray-100 dark:bg-gray-800",
            "text-gray-600 dark:text-gray-400",
            "border border-gray-200 dark:border-gray-700",
            "select-none"
          )}
        >
          {language}
        </div>
      )}
      <pre
        ref={preRef}
        className={cn(
          "bg-white dark:bg-gray-900",
          "border border-gray-200 dark:border-gray-700",
          "rounded-xl py-3 px-3 pr-12",
          "text-gray-800 dark:text-gray-100",
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
          "text-gray-400 dark:text-gray-500",
          "hover:text-gray-600 dark:hover:text-gray-300",
          "hover:bg-gray-100 dark:hover:bg-gray-800",
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
