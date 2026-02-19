"use client";

import { cn } from "@duyet/libs/utils";
import { Check, ChevronDown, Copy, ExternalLink, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface MarkdownMenuProps {
  markdownUrl: string;
  onCopyMarkdown: () => Promise<void>;
}

export function MarkdownMenu({
  markdownUrl,
  onCopyMarkdown,
}: MarkdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleCopy = async () => {
    await onCopyMarkdown();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setIsOpen(false);
  };

  const handleChatInClaude = () => {
    const claudeUrl = `https://claude.ai/new?q=${encodeURIComponent(`Please analyze this blog post:\n\n${window.location.href}`)}`;
    window.open(claudeUrl, "_blank");
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Compact trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <Copy className="h-3.5 w-3.5" />
        <span>Copy</span>
        <ChevronDown
          className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className={cn(
            "absolute right-0 z-50 mt-2 w-48",
            "rounded-xl border border-gray-200 dark:border-slate-700",
            "bg-white dark:bg-slate-800",
            "shadow-lg",
            "overflow-hidden"
          )}
        >
          <button
            onClick={handleCopy}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? "Copied!" : "Copy as Markdown"}
          </button>

          <a
            href={markdownUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50"
            onClick={() => setIsOpen(false)}
          >
            <ExternalLink className="h-4 w-4" />
            Open Markdown
          </a>

          <button
            onClick={handleChatInClaude}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50"
          >
            <Sparkles className="h-4 w-4 text-terracotta" />
            Chat in Claude.ai
          </button>
        </div>
      )}
    </div>
  );
}
