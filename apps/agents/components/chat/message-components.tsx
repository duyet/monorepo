import type { UIMessage } from "ai";
import { Check, Copy, X } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
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
import { Button } from "@/components/ui/button";
import type { Message } from "@/lib/types";
import { cn } from "@/lib/utils";
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
    <MessageRoot from="user" className="justify-end">
      <MessageContent
        from="user"
        className="rounded-xl border-none bg-white px-5 py-4 shadow-none"
      >
        <p className="whitespace-pre-wrap break-words text-base font-medium leading-7 text-foreground">
          {message.content}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">
            {formatRelativeTime(message.timestamp)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 rounded-md opacity-0 transition-opacity group-hover:opacity-100"
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
      <MessageContent
        from="assistant"
        className="rounded-xl border-none bg-transparent px-0 py-2 shadow-none"
      >
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
                          isStreaming={
                            isStreaming && part.state === "input-streaming"
                          }
                        />

                        {/* Approval workflow */}
                        <Confirmation
                          approval={part.approval}
                          state={part.state}
                        >
                          <ConfirmationRequest>
                            <p className="text-sm text-foreground">
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
                            <p className="text-sm text-emerald-600">
                              You approved this tool execution
                            </p>
                          </ConfirmationAccepted>
                          <ConfirmationRejected>
                            <p className="text-sm text-red-600">
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

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">
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
    <span className="ml-0.5 inline-flex animate-pulse align-middle">
      <span className="h-[1em] w-0.5 bg-foreground" />
    </span>
  );
}

const SUGGESTION_CATEGORIES = [
  {
    id: "get-started",
    label: "Get Started",
    suggestions: [
      {
        prefix: "Search",
        label: "blog posts about ClickHouse",
        prompt: "Search blog posts about ClickHouse",
      },
      {
        prefix: "Tell me about",
        label: "Duyet's work experience",
        prompt: "Tell me about Duyet's work experience",
      },
    ],
  },
  {
    id: "explore",
    label: "Explore",
    suggestions: [
      {
        prefix: "What has Duyet been",
        label: "working on recently?",
        prompt: "What has Duyet been working on recently?",
      },
      {
        prefix: "Show me the",
        label: "contact form analytics",
        prompt: "Show me the contact form analytics",
      },
    ],
  },
];

interface WelcomeMessageProps {
  onPromptSelect?: (prompt: string) => void;
  disabled?: boolean;
}

export function WelcomeMessage({
  onPromptSelect,
  disabled,
}: WelcomeMessageProps) {
  return (
    <div className="mx-auto w-full px-0 py-6 sm:py-12">
      <div className="mb-10">
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          How can I help?
        </h1>
        <p className="mt-5 max-w-[520px] text-lg font-medium leading-snug tracking-tight text-muted-foreground">
          Ask about Duyet's writing, CV, GitHub activity, analytics, or current
          project context.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {SUGGESTION_CATEGORIES.flatMap((category) => category.suggestions).map(
          ({ prefix, label, prompt }, index) => (
            <button
              key={prompt}
              type="button"
              disabled={disabled}
              onClick={() => onPromptSelect?.(prompt)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-[#f0f0e8]",
                "animate-in fade-in slide-in-from-top-2 duration-200",
                disabled && "pointer-events-none opacity-50"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="font-medium">{prefix}</span>
              <span className="text-muted-foreground">{label}</span>
            </button>
          )
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Artifact-compatible message components (ai-chatbot template compatibility)
// ---------------------------------------------------------------------------

interface PreviewMessageProps {
  chatId: string;
  message: import("@/lib/types").ChatMessage;
  isLoading: boolean;
  isReadonly: boolean;
  requiresScrollPadding: boolean;
  setMessages: (messages: unknown[] | ((prev: unknown[]) => unknown[])) => void;
}

export function PreviewMessage({ message, isLoading }: PreviewMessageProps) {
  if (message.role === "user") {
    return (
      <MessageRoot from="user" className="justify-end">
        <MessageContent
          from="user"
          className="rounded-xl border-none bg-white px-5 py-4 shadow-none"
        >
          {message.parts
            ?.filter(
              (p): p is { type: "text"; text: string } => p.type === "text"
            )
            .map((p, i) => (
              <p
                key={i}
                className="whitespace-pre-wrap break-words text-[15px] leading-7 text-foreground"
              >
                {p.text}
              </p>
            ))}
        </MessageContent>
      </MessageRoot>
    );
  }

  return (
    <MessageRoot from="assistant">
      <MessageContent from="assistant">
        {message.parts?.map((part, i) => {
          if (part.type === "text") {
            return <MessageResponse key={i}>{part.text}</MessageResponse>;
          }
          return null;
        })}
        {isLoading && <StreamingCursor />}
      </MessageContent>
    </MessageRoot>
  );
}

export function ThinkingMessage() {
  return (
    <MessageRoot from="assistant">
      <MessageContent from="assistant">
        <StreamingCursor />
      </MessageContent>
    </MessageRoot>
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
