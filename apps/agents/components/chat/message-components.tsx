"use client";

import type { Message } from "@/lib/types";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { Button } from "@duyet/components";
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
        <div className="rounded-2xl rounded-br-sm bg-neutral-900 px-4 py-2.5 text-white dark:bg-neutral-100 dark:text-neutral-900">
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {message.content}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-neutral-400 font-[family-name:var(--font-geist-mono)]">
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
      {/* Avatar */}
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
        <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400">D</span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed text-neutral-800 dark:text-neutral-200">
          <Markdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
            components={{
              a: ({ ...props }) => (
                <a
                  {...props}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-900 underline underline-offset-2 decoration-neutral-300 hover:decoration-neutral-900 transition-colors dark:text-neutral-100"
                />
              ),
              code: ({ ...props }) => (
                <code
                  {...props}
                  className="px-1.5 py-0.5 bg-neutral-100 rounded text-[12px] font-[family-name:var(--font-geist-mono)] text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
                />
              ),
              pre: ({ ...props }) => (
                <pre
                  {...props}
                  className="bg-neutral-100 border border-neutral-200 rounded-2xl p-4 overflow-x-auto text-[12px] font-[family-name:var(--font-geist-mono)] dark:bg-neutral-800 dark:border-neutral-700"
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
          <span className="text-[11px] text-neutral-400 font-[family-name:var(--font-geist-mono)]">
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
      <span className="w-0.5 h-[1em] bg-neutral-900 dark:bg-neutral-100" />
    </span>
  );
}

const CAPABILITIES = [
  {
    icon: BookOpen,
    label: "Blog Search",
    desc: "296+ posts on data engineering, cloud, and programming",
    prompt: "Search blog posts about ClickHouse",
    color: "bg-orange-100/50 dark:bg-orange-950/30",
    iconColor: "text-orange-700 dark:text-orange-400",
  },
  {
    icon: User,
    label: "CV",
    desc: "Experience, skills, and professional background",
    prompt: "Tell me about Duyet's work experience",
    color: "bg-purple-100/50 dark:bg-purple-950/30",
    iconColor: "text-purple-700 dark:text-purple-400",
  },
  {
    icon: GitBranch,
    label: "GitHub",
    desc: "Recent commits, pull requests, and open source contributions",
    prompt: "What has Duyet been working on recently?",
    color: "bg-blue-100/50 dark:bg-blue-950/30",
    iconColor: "text-blue-700 dark:text-blue-400",
  },
  {
    icon: BarChart2,
    label: "Analytics",
    desc: "Contact form stats and site performance insights",
    prompt: "Show me the contact form analytics",
    color: "bg-amber-100/60 dark:bg-amber-950/30",
    iconColor: "text-amber-700 dark:text-amber-400",
  },
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
    <div className="py-12 sm:py-16 animate-in fade-in duration-500">
      {/* Header — about page style */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 font-serif text-5xl font-normal text-neutral-900 dark:text-neutral-100 sm:text-6xl">
          @duyetbot
        </h1>
        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
          Virtual version of Duyet. Ask me about blog posts, career, GitHub
          activity, or analytics.
        </p>
      </div>

      {/* Capability cards — about page card style */}
      <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {CAPABILITIES.map(({ icon: Icon, label, desc, prompt, color, iconColor }) => (
          <button
            key={label}
            type="button"
            onClick={() => onPromptSelect?.(prompt)}
            className={`group flex flex-col p-8 ${color} rounded-3xl transition-transform duration-200 hover:scale-[1.02] cursor-pointer text-left border-0`}
          >
            <div className={`mb-6 ${iconColor}`}>
              <Icon className="h-10 w-10" strokeWidth={1.5} />
            </div>
            <h3 className="mb-2 text-lg font-medium text-neutral-900 dark:text-neutral-100">
              {label}
            </h3>
            <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {desc}
            </p>
          </button>
        ))}
      </div>

      {/* Quick-start prompts — skills section style */}
      <div className="rounded-3xl bg-stone-100/70 px-8 py-6 dark:bg-neutral-800/50">
        <h2 className="mb-4 font-serif text-xl font-normal text-neutral-900 dark:text-neutral-100">
          Quick starts
        </h2>
        <div className="flex flex-wrap gap-3">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => onPromptSelect?.(prompt)}
              className="inline-block rounded-full bg-neutral-50 px-5 py-2 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-100 cursor-pointer dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600"
            >
              {prompt}
            </button>
          ))}
        </div>
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
