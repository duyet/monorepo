import { jsxs, jsx } from "react/jsx-runtime";
import { c as cn } from "./router-BL7fPxbg.js";
import { Check, Copy } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import "@tanstack/react-router";
import "fs";
import "remark-math";
import "react-dom";
import "next-themes";
function useClipboard(options = {}) {
  const { timeout = 2e3 } = options;
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);
  const copy = useCallback(
    async (text) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        if (timerRef.current !== null) {
          clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => {
          timerRef.current = null;
          setCopied(false);
        }, timeout);
      } catch (error) {
        console.error("Failed to copy to clipboard:", error);
        setCopied(false);
      }
    },
    [timeout]
  );
  const reset = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setCopied(false);
  }, []);
  return { copied, copy, reset };
}
const LANGUAGE_LABELS = {
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
  git: "Git"
};
function extractLanguage(className) {
  if (!className) return null;
  const langMatch = className.match(/language-(\w+)/);
  if (langMatch) {
    const lang = langMatch[1];
    return LANGUAGE_LABELS[lang] || lang.charAt(0).toUpperCase() + lang.slice(1);
  }
  return null;
}
function CodeBlock({ children, className, ...props }) {
  const { copied, copy } = useClipboard();
  const preRef = useRef(null);
  const language = extractLanguage(className);
  const handleCopy = async () => {
    if (preRef.current) {
      await copy(preRef.current.textContent || "");
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "relative group", children: [
    language && /* @__PURE__ */ jsx(
      "div",
      {
        className: cn(
          "absolute top-3 left-3",
          "px-2 py-0.5",
          "text-xs font-medium",
          "rounded-md",
          "bg-gray-100 dark:bg-gray-800",
          "text-gray-600 dark:text-gray-400",
          "border border-gray-200 dark:border-gray-700",
          "select-none"
        ),
        children: language
      }
    ),
    /* @__PURE__ */ jsx(
      "pre",
      {
        ref: preRef,
        className: cn(
          "bg-white dark:bg-gray-900",
          "border border-gray-200 dark:border-gray-700",
          "rounded-xl py-3 px-3 pr-12",
          "text-gray-800 dark:text-gray-100",
          "overflow-x-auto",
          "text-sm",
          language && "pt-10",
          className
        ),
        ...props,
        children
      }
    ),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: handleCopy,
        className: cn(
          "absolute top-3 right-3",
          "p-1.5",
          "rounded-md",
          "text-gray-400 dark:text-gray-500",
          "hover:text-gray-600 dark:hover:text-gray-300",
          "hover:bg-gray-100 dark:hover:bg-gray-800",
          "transition-all duration-200",
          "opacity-0 group-hover:opacity-100",
          "focus:opacity-100"
        ),
        "aria-label": "Copy code",
        title: "Copy code",
        children: copied ? /* @__PURE__ */ jsx(Check, { className: "h-4 w-4 text-green-500" }) : /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4" })
      }
    )
  ] });
}
export {
  CodeBlock
};
