"use client";

import type { Message } from "@/lib/types";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { Button } from "@/components/ui/button";
import { Copy, Check, BookOpen, User, GitBranch, BarChart2 } from "lucide-react";
import { useState } from "react";

interface MessageProps {
  message: Message;
  isStreaming?: boolean;
}

export function UserMessage({ message }: { message: Message }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex justify-end gap-3 group">
      <div className="flex max-w-[80%] flex-col items-end gap-1">
        <div className="rounded-2xl rounded-br-sm bg-foreground px-4 py-2.5 text-background">
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {message.content}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground/60 font-[family-name:var(--font-geist-mono)]">
            {formatRelativeTime(message.timestamp)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            <span className="sr-only">Copy</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AssistantMessage({ message, isStreaming }: MessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex justify-start gap-3 group">
      {/* Avatar — warm oat circle */}
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted">
        <span className="text-[10px] font-bold text-muted-foreground">D</span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">
          <Markdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
            components={{
              a: ({ ...props }) => (
                <a
                  {...props}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground underline underline-offset-2 decoration-border hover:decoration-foreground transition-colors"
                />
              ),
              code: ({ ...props }) => (
                <code
                  {...props}
                  className="px-1.5 py-0.5 bg-muted rounded text-[12px] font-[family-name:var(--font-geist-mono)] text-foreground"
                />
              ),
              pre: ({ ...props }) => (
                <pre
                  {...props}
                  className="bg-muted border border-border rounded-md p-4 overflow-x-auto text-[12px] font-[family-name:var(--font-geist-mono)]"
                />
              ),
              p: ({ ...props }) => <p {...props} className="mb-2 last:mb-0" />,
              ul: ({ ...props }) => <ul {...props} className="mb-2 last:mb-0 space-y-0.5 pl-4" />,
              ol: ({ ...props }) => <ol {...props} className="mb-2 last:mb-0 space-y-0.5 pl-4" />,
            }}
          >
            {message.content}
          </Markdown>
          {isStreaming && <StreamingCursor />}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground/60 font-[family-name:var(--font-geist-mono)]">
            {formatRelativeTime(message.timestamp)}
          </span>
          {!isStreaming && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleCopy}
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              <span className="sr-only">Copy</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function StreamingCursor() {
  return (
    <span className="inline-flex ml-0.5 align-middle animate-pulse">
      <span className="w-0.5 h-[1em] bg-foreground" />
    </span>
  );
}

const CAPABILITIES = [
  { icon: BookOpen,  label: "Blog Search", desc: "296+ posts",          prompt: "Search blog posts about ClickHouse", color: "bg-[#f4b8a0]", iconColor: "text-[#c25a30]" },
  { icon: User,      label: "CV",          desc: "Experience & skills",  prompt: "Tell me about Duyet's work experience", color: "bg-[#d4e3de]", iconColor: "text-[#4a7a6e]" },
  { icon: GitBranch, label: "GitHub",      desc: "Commits, PRs, issues", prompt: "What has Duyet been working on recently?", color: "bg-[#dfe0ec]", iconColor: "text-[#5a5e8a]" },
  { icon: BarChart2, label: "Analytics",   desc: "Contact stats",        prompt: "Show me the contact form analytics", color: "bg-[#ebe5db]", iconColor: "text-[#7a6a50]" },
];

const QUICK_PROMPTS = [
  "What is Duyet's tech stack?",
  "Find posts about Rust",
  "Show recent GitHub activity",
  "Summarize Duyet's CV",
];

interface WelcomeMessageProps {
  content: string;
  onPromptSelect?: (prompt: string) => void;
}

export function WelcomeMessage({ content: _, onPromptSelect }: WelcomeMessageProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-8 animate-in fade-in duration-500">
      {/* Identity */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
          <span className="text-primary-foreground text-lg font-bold font-[family-name:var(--font-serif)]">D</span>
        </div>
        <div>
          <h2 className="text-lg font-bold font-[family-name:var(--font-serif)] tracking-tight text-foreground">@duyetbot</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Virtual version of Duyet · Ask me anything</p>
        </div>
      </div>

      {/* Capability cards — 2×2 grid with home-page card colors */}
      <div className="grid grid-cols-2 gap-2.5 w-full max-w-sm">
        {CAPABILITIES.map(({ icon: Icon, label, desc, prompt, color, iconColor }) => (
          <button
            key={label}
            type="button"
            onClick={() => onPromptSelect?.(prompt)}
            className={`flex items-start gap-2.5 rounded-2xl px-4 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm cursor-pointer text-left border-0 ${color}`}
          >
            <Icon className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${iconColor}`} />
            <div>
              <p className="text-xs font-semibold text-neutral-800">{label}</p>
              <p className="text-[11px] text-neutral-600 mt-0.5">{desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Quick-start prompt chips — home-page tag style */}
      <div className="flex flex-wrap justify-center gap-2 w-full max-w-sm">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onPromptSelect?.(prompt)}
            className="rounded-full bg-muted/70 px-3 py-1 text-[11px] font-medium text-foreground hover:bg-muted transition-colors cursor-pointer dark:bg-muted dark:text-foreground"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}
