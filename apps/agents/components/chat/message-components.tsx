"use client";

import type { Message } from "@/lib/types";
import type { UIMessage } from "ai";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { Button } from "@duyet/components";
import { Copy, Check, X, BookOpen, User, GitBranch, BarChart2 } from "lucide-react";
import { useState, useCallback } from "react";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import {
  Confirmation,
  ConfirmationRequest,
  ConfirmationAccepted,
  ConfirmationRejected,
  ConfirmationActions,
  ConfirmationAction,
} from "@/components/ai-elements/confirmation";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";

interface MessageProps {
  message: Message;
  isStreaming?: boolean;
}

interface AssistantMessageProps extends MessageProps {
  parts?: UIMessage["parts"];
  onToolApprove?: (id: string) => void;
  onToolDeny?: (id: string, reason?: string) => void;
}

type CopyState = "idle" | "copied" | "failed";

function useCopyToClipboard(text: string): { state: CopyState; copy: () => void } {
  const [state, setState] = useState<CopyState>("idle");

  const copy = useCallback(async () => {
    if (!navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("failed");
      setTimeout(() => setState("idle"), 2000);
    }
  }, [text]);

  return { state, copy };
}

function CopyIcon({ state }: { state: CopyState }) {
  switch (state) {
    case "copied":
      return <Check className="h-3 w-3" />;
    case "failed":
      return <X className="h-3 w-3 text-red-500" />;
    default:
      return <Copy className="h-3 w-3" />;
  }
}

export function UserMessage({ message }: MessageProps) {
  const { state: copyState, copy: handleCopy } = useCopyToClipboard(message.content);

  return (
    <div className="flex justify-end gap-3 group animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex max-w-[75%] flex-col items-end gap-1">
        <div className="rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-primary-foreground">
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {message.content}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground font-[family-name:var(--font-geist-mono)]">
            {formatRelativeTime(message.timestamp)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleCopy}
          >
            <CopyIcon state={copyState} />
            <span className="sr-only">Copy</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

const MARKDOWN_COMPONENTS = {
  a: ({ ...props }: React.ComponentProps<"a">) => (
    <a
      {...props}
      target="_blank"
      rel="noopener noreferrer"
      className="text-foreground underline underline-offset-2 decoration-muted-foreground/40 hover:decoration-foreground transition-colors"
    />
  ),
  code: ({ ...props }: React.ComponentProps<"code">) => (
    <code
      {...props}
      className="px-1.5 py-0.5 bg-muted rounded text-[12px] font-[family-name:var(--font-geist-mono)] text-foreground"
    />
  ),
  pre: ({ ...props }: React.ComponentProps<"pre">) => (
    <pre
      {...props}
      className="bg-muted border border-border rounded-2xl p-4 overflow-x-auto text-[12px] font-[family-name:var(--font-geist-mono)]"
    />
  ),
  p: ({ ...props }: React.ComponentProps<"p">) => <p {...props} className="mb-2 last:mb-0" />,
  ul: ({ ...props }: React.ComponentProps<"ul">) => <ul {...props} className="mb-2 last:mb-0 space-y-0.5 pl-4" />,
  ol: ({ ...props }: React.ComponentProps<"ol">) => <ol {...props} className="mb-2 last:mb-0 space-y-0.5 pl-4" />,
};

export function AssistantMessage({ message, isStreaming, parts, onToolApprove, onToolDeny }: AssistantMessageProps) {
  const { state: copyState, copy: handleCopy } = useCopyToClipboard(message.content);
  const hasParts = parts && parts.length > 0;

  return (
    <div className="flex justify-start gap-3 group animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Avatar */}
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted">
        <span className="text-[10px] font-bold text-muted-foreground">D</span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="text-sm leading-relaxed text-foreground [&_a]:underline [&_a]:underline-offset-2 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[12px] [&_code]:font-[family-name:var(--font-geist-mono)] [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-border [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:text-[12px] [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:pl-4 [&_ul]:space-y-0.5 [&_ol]:pl-4 [&_ol]:space-y-0.5">
          {hasParts ? (
            <>
              {parts.map((part, i) => {
                if (part.type === "reasoning") {
                  const isStreaming = part.state === "streaming";
                  return (
                    <Reasoning
                      key={`reasoning-${i}`}
                      isStreaming={isStreaming}
                      defaultOpen={isStreaming}
                    >
                      <ReasoningTrigger />
                      <ReasoningContent>{part.text}</ReasoningContent>
                    </Reasoning>
                  );
                }
                if (part.type === "text") {
                  return (
                    <Markdown
                      key={`text-${i}`}
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeSanitize]}
                      components={MARKDOWN_COMPONENTS}
                    >
                      {part.text}
                    </Markdown>
                  );
                }
                if (part.type === "dynamic-tool") {
                  return (
                    <Tool
                      key={part.toolCallId}
                      defaultOpen={part.state === "output-available" || part.state === "output-error"}
                    >
                      <ToolHeader
                        type="dynamic-tool"
                        state={part.state}
                        toolName={part.toolName}
                      />
                      <ToolContent>
                        <ToolInput input={part.input} />
                        <ToolOutput output={part.output} errorText={part.errorText} />

                        {/* Approval workflow */}
                        <Confirmation approval={part.approval} state={part.state}>
                          <ConfirmationRequest>
                            <p className="text-sm">
                              Do you want to approve <strong>{part.toolName}</strong>?
                            </p>
                            <ConfirmationActions>
                              <ConfirmationAction
                                onClick={() => onToolDeny?.(part.approval!.id)}
                                variant="outline"
                              >
                                Deny
                              </ConfirmationAction>
                              <ConfirmationAction
                                onClick={() => onToolApprove?.(part.approval!.id)}
                              >
                                Approve
                              </ConfirmationAction>
                            </ConfirmationActions>
                          </ConfirmationRequest>
                          <ConfirmationAccepted>
                            <p className="text-sm text-green-600 dark:text-green-400">
                              You approved this tool execution
                            </p>
                          </ConfirmationAccepted>
                          <ConfirmationRejected>
                            <p className="text-sm text-red-600 dark:text-red-400">
                              You rejected this tool execution
                            </p>
                          </ConfirmationRejected>
                        </Confirmation>
                      </ToolContent>
                    </Tool>
                  );
                }
                return null;
              })}
              {isStreaming && <StreamingCursor />}
            </>
          ) : message.content ? (
            <>
              <Markdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSanitize]}
                components={MARKDOWN_COMPONENTS}
              >
                {message.content}
              </Markdown>
              {isStreaming && <StreamingCursor />}
            </>
          ) : isStreaming ? (
            <StreamingCursor />
          ) : (
            <span className="text-muted-foreground italic text-xs">No response</span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground font-[family-name:var(--font-geist-mono)]">
            {formatRelativeTime(message.timestamp)}
          </span>
          {!isStreaming && message.content && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleCopy}
            >
              <CopyIcon state={copyState} />
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
  onPromptSelect?: (prompt: string) => void;
}

export function WelcomeMessage({ onPromptSelect }: WelcomeMessageProps) {
  return (
    <div className="py-12 sm:py-16 animate-in fade-in duration-500">
      {/* Greeting */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-normal text-foreground mb-2">
          Hi, I&apos;m Duyet&apos;s AI assistant
        </h1>
        <p className="text-sm text-muted-foreground">
          Ask me about blog posts, CV, GitHub activity, or anything else
        </p>
      </div>

      {/* Capability cards */}
      <div className="mb-8 grid gap-4 grid-cols-1 sm:grid-cols-2">
        {CAPABILITIES.map(({ icon: Icon, label, desc, prompt, color, iconColor }) => (
          <button
            key={label}
            type="button"
            onClick={() => onPromptSelect?.(prompt)}
            className={`group flex flex-col p-6 ${color} rounded-xl transition-all duration-200 hover:scale-[1.02] cursor-pointer text-left border-0`}
          >
            <div className={`mb-4 ${iconColor}`}>
              <Icon className="h-8 w-8" strokeWidth={1.5} />
            </div>
            <h3 className="mb-2 text-base font-semibold text-foreground">
              {label}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {desc}
            </p>
          </button>
        ))}
      </div>

      {/* Quick-start prompts */}
      <div className="mb-10">
        <h2 className="mb-4 text-sm font-medium text-muted-foreground">
          Quick starts
        </h2>
        <div className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory pb-2 sm:flex-wrap sm:overflow-visible sm:snap-none sm:pb-0">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => onPromptSelect?.(prompt)}
              className="shrink-0 snap-start rounded-full bg-muted px-5 py-2 text-sm font-medium text-foreground transition-all hover:bg-accent cursor-pointer"
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
