"use client";

import { Button } from "@duyet/components";
import type { UIMessage } from "ai";
import {
  BarChart2,
  BookOpen,
  Check,
  Copy,
  GitBranch,
  User,
  X,
} from "lucide-react";
import { useMemo } from "react";
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
} from "@/components/ai-elements/chain-of-thought";
import {
  Confirmation,
  ConfirmationAccepted,
  ConfirmationAction,
  ConfirmationActions,
  ConfirmationRejected,
  ConfirmationRequest,
} from "@/components/ai-elements/confirmation";
import {
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
  Message as MessageRoot,
  useCopyToClipboard,
} from "@/components/ai-elements/message";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import type { Message } from "@/lib/types";
import { MessageMetadata } from "./message-metadata";

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
  const { state: copyState, copy: handleCopy } = useCopyToClipboard(
    message.content
  );

  return (
    <MessageRoot from="user">
      <MessageContent from="user">
        <p className="whitespace-pre-wrap break-words text-base leading-relaxed">
          {message.content}
        </p>
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
      </MessageContent>
    </MessageRoot>
  );
}

export function AssistantMessage({
  message,
  isStreaming,
  parts,
  onToolApprove,
  onToolDeny,
}: AssistantMessageProps) {
  const { state: copyState, copy: handleCopy } = useCopyToClipboard(
    message.content
  );
  const hasParts = parts && parts.length > 0;

  // Merge ALL reasoning parts into one collapsible, keep other parts in order
  const groupedParts = useMemo(() => {
    if (!parts) return [];

    const reasoningTexts: string[] = [];
    let lastReasoningState: string | undefined;
    const nonReasoningParts: Array<{
      part: (typeof parts)[0];
      originalIndex: number;
    }> = [];

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part.type === "reasoning") {
        reasoningTexts.push(part.text);
        lastReasoningState = part.state;
      } else {
        nonReasoningParts.push({ part, originalIndex: i });
      }
    }

    const result: Array<{
      type: "reasoning-group" | "single";
      reasoningText?: string;
      reasoningState?: string;
      part?: (typeof parts)[0];
      originalIndex: number;
    }> = [];

    // Single merged reasoning group at the top
    if (reasoningTexts.length > 0) {
      result.push({
        type: "reasoning-group",
        reasoningText: reasoningTexts.join(""),
        reasoningState: lastReasoningState,
        originalIndex: 0,
      });
    }

    // All non-reasoning parts in original order
    for (const { part, originalIndex } of nonReasoningParts) {
      result.push({ type: "single", part, originalIndex });
    }

    return result;
  }, [parts]);

  const isReasoningStreaming =
    groupedParts[0]?.type === "reasoning-group" &&
    groupedParts[0]?.reasoningState === "streaming";

  return (
    <MessageRoot from="assistant">
      <MessageContent from="assistant">
        {hasParts ? (
          <>
            {groupedParts.map((grouped) => {
              if (grouped.type === "reasoning-group") {
                if (!grouped.reasoningText) return null;

                return (
                  <ChainOfThought
                    key={`reasoning-${grouped.originalIndex}`}
                    isStreaming={isReasoningStreaming}
                    defaultOpen={isReasoningStreaming}
                  >
                    <ChainOfThoughtHeader />
                    <ChainOfThoughtContent>
                      {grouped.reasoningText ?? ""}
                    </ChainOfThoughtContent>
                  </ChainOfThought>
                );
              }

              if (grouped.type === "single" && grouped.part) {
                const part = grouped.part;
                if (part.type === "text") {
                  return (
                    <MessageResponse key={`text-${grouped.originalIndex}`}>
                      {part.text}
                    </MessageResponse>
                  );
                } else if (part.type === "dynamic-tool") {
                  return (
                    <Tool
                      key={part.toolCallId}
                      defaultOpen={
                        part.state === "output-available" ||
                        part.state === "output-error"
                      }
                    >
                      <ToolHeader
                        type="dynamic-tool"
                        state={part.state}
                        toolName={part.toolName}
                      />
                      <ToolContent>
                        <ToolInput input={part.input} />
                        <ToolOutput
                          output={part.output}
                          errorText={part.errorText}
                        />

                        {/* Approval workflow */}
                        <Confirmation
                          approval={part.approval}
                          state={part.state}
                        >
                          <ConfirmationRequest>
                            <p className="text-sm">
                              Do you want to approve{" "}
                              <strong>{part.toolName}</strong>?
                            </p>
                            <ConfirmationActions>
                              <ConfirmationAction
                                onClick={() => onToolDeny?.(part.approval!.id)}
                                variant="outline"
                              >
                                Deny
                              </ConfirmationAction>
                              <ConfirmationAction
                                onClick={() =>
                                  onToolApprove?.(part.approval!.id)
                                }
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
              }
              return null;
            })}
            {isStreaming && <StreamingCursor />}
          </>
        ) : message.content ? (
          <>
            <MessageResponse>{message.content}</MessageResponse>
            {isStreaming && <StreamingCursor />}
          </>
        ) : isStreaming ? (
          <StreamingCursor />
        ) : (
          <span className="text-muted-foreground italic text-xs">
            No response
          </span>
        )}

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground font-[family-name:var(--font-geist-mono)]">
            {formatRelativeTime(message.timestamp)}
          </span>
          <MessageMetadata message={message} isStreaming={isStreaming} />
          {!isStreaming && message.content && (
            <MessageActions>
              <MessageAction tooltip="Copy" onClick={handleCopy}>
                <CopyIcon state={copyState} />
              </MessageAction>
            </MessageActions>
          )}
        </div>
      </MessageContent>
    </MessageRoot>
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
    <div className="py-12 sm:py-20 animate-in fade-in duration-700 flex flex-col items-center justify-center text-center">
      {/* Greeting */}
      <div className="mb-10">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
          <span className="text-2xl font-[family-name:var(--font-serif)] font-bold">
            D
          </span>
        </div>
        <h1 className="text-3xl font-[family-name:var(--font-serif)] text-foreground tracking-tight mb-3">
          How can I help you today?
        </h1>
        <p className="text-base text-muted-foreground max-w-md mx-auto">
          Ask me about my blog posts, GitHub projects, CV, or anything else.
        </p>
      </div>

      {/* Quick-start prompts */}
      <div className="w-full max-w-2xl mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {CAPABILITIES.map(({ icon: Icon, label, prompt }) => (
            <button
              key={label}
              type="button"
              onClick={() => onPromptSelect?.(prompt)}
              className="group flex flex-col items-start gap-2 p-4 rounded-xl bg-transparent hover:bg-muted/50 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{label}</span>
              </div>
              <span className="text-xs text-muted-foreground line-clamp-1">
                {prompt}
              </span>
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
