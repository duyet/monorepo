"use client";

import type { ComponentProps, ReactNode } from "react";
import { useState, useCallback, useRef } from "react";

import { cjk } from "@streamdown/cjk";
import { code } from "@streamdown/code";
import { math } from "@streamdown/math";
import { mermaid } from "@streamdown/mermaid";
import { FileIcon } from "lucide-react";
import { Streamdown } from "streamdown";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type MessageFrom = "user" | "assistant" | "system";

// ─── Message (root) ───────────────────────────────────────────────────────────

export interface MessageProps {
  from: MessageFrom;
  className?: string;
  children: ReactNode;
}

export function Message({ from, className, children }: MessageProps) {
  const isUser = from === "user";

  return (
    <div
      data-from={from}
      className={cn(
        "flex gap-3 group animate-in fade-in slide-in-from-bottom-2 duration-300",
        isUser ? "justify-end" : "justify-start",
        className
      )}
    >
      {/* Assistant avatar — shown on the left */}
      {!isUser && (
        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted">
          <span className="text-[10px] font-bold text-muted-foreground">D</span>
        </div>
      )}

      {children}
    </div>
  );
}

Message.displayName = "Message";

// ─── MessageContent ───────────────────────────────────────────────────────────

export interface MessageContentProps {
  from?: MessageFrom;
  className?: string;
  children: ReactNode;
}

export function MessageContent({ from, className, children }: MessageContentProps) {
  const isUser = from === "user";

  return (
    <div
      className={cn(
        isUser
          ? "flex max-w-[75%] flex-col items-end gap-1"
          : "flex min-w-0 flex-1 flex-col gap-1",
        className
      )}
    >
      {isUser ? (
        <div className="rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-primary-foreground">
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
}

MessageContent.displayName = "MessageContent";

// ─── MessageResponse (Streamdown renderer) ────────────────────────────────────

const streamdownPlugins = { cjk, code, math, mermaid };

export interface MessageResponseProps {
  children: string;
  parseIncompleteMarkdown?: boolean;
  components?: ComponentProps<typeof Streamdown>["components"];
  className?: string;
}

export function MessageResponse({
  children,
  parseIncompleteMarkdown = true,
  components,
  className,
}: MessageResponseProps) {
  return (
    <div
      className={cn(
        "text-sm leading-relaxed text-foreground",
        "[&_a]:underline [&_a]:underline-offset-2",
        "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5",
        "[&_code]:text-[12px] [&_code]:font-[family-name:var(--font-geist-mono)]",
        "[&_pre]:rounded-xl [&_pre]:border [&_pre]:border-border [&_pre]:bg-muted",
        "[&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:text-[12px]",
        "[&_p]:mb-2 [&_p:last-child]:mb-0",
        "[&_ul]:pl-4 [&_ul]:space-y-0.5 [&_ol]:pl-4 [&_ol]:space-y-0.5",
        className
      )}
    >
      <Streamdown
        plugins={streamdownPlugins}
        parseIncompleteMarkdown={parseIncompleteMarkdown}
        components={components}
      >
        {children}
      </Streamdown>
    </div>
  );
}

MessageResponse.displayName = "MessageResponse";

// ─── MessageActions ───────────────────────────────────────────────────────────

export interface MessageActionsProps {
  className?: string;
  children: ReactNode;
}

export function MessageActions({ className, children }: MessageActionsProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
        className
      )}
    >
      {children}
    </div>
  );
}

MessageActions.displayName = "MessageActions";

// ─── MessageAction (individual button with tooltip) ───────────────────────────

export interface MessageActionProps {
  tooltip: string;
  label?: string;
  onClick?: () => void;
  className?: string;
  children: ReactNode;
}

export function MessageAction({
  tooltip,
  label,
  onClick,
  className,
  children,
}: MessageActionProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={label ?? tooltip}
            onClick={onClick}
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded text-muted-foreground",
              "hover:text-foreground hover:bg-muted transition-colors",
              className
            )}
          >
            {children}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

MessageAction.displayName = "MessageAction";

// ─── MessageAttachments ───────────────────────────────────────────────────────

export interface MessageAttachmentsProps {
  className?: string;
  children: ReactNode;
}

export function MessageAttachments({ className, children }: MessageAttachmentsProps) {
  return (
    <div className={cn("flex flex-wrap gap-2 mt-1", className)}>
      {children}
    </div>
  );
}

MessageAttachments.displayName = "MessageAttachments";

// ─── MessageAttachment (individual file) ─────────────────────────────────────

export interface MessageAttachmentProps {
  name: string;
  contentType?: string;
  url?: string;
  className?: string;
}

export function MessageAttachment({
  name,
  contentType,
  url,
  className,
}: MessageAttachmentProps) {
  const isImage = contentType?.startsWith("image/");

  if (isImage && url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "block overflow-hidden rounded-lg border border-border",
          className
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={name}
          className="max-h-40 max-w-xs object-cover"
        />
      </a>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-lg border border-border bg-muted px-2.5 py-1.5 text-xs",
        "text-muted-foreground",
        className
      )}
    >
      <FileIcon className="h-3.5 w-3.5 shrink-0" />
      <span className="max-w-[160px] truncate">{name}</span>
    </div>
  );
}

MessageAttachment.displayName = "MessageAttachment";

// ─── useCopyToClipboard (extracted hook) ──────────────────────────────────────

export type CopyState = "idle" | "copied" | "failed";

export function useCopyToClipboard(text: string): {
  state: CopyState;
  copy: () => void;
} {
  const [state, setState] = useState<CopyState>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(async () => {
    if (!navigator.clipboard) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("failed");
    }
    timeoutRef.current = setTimeout(() => setState("idle"), 2000);
  }, [text]);

  return { state, copy };
}
