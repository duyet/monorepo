import { cjk } from "@streamdown/cjk";
import { code } from "@streamdown/code";
import { math } from "@streamdown/math";
import { mermaid } from "@streamdown/mermaid";
import { FileIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { useCallback, useRef, useState } from "react";
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
        "flex gap-4 w-full group animate-in fade-in duration-500",
        isUser ? "justify-end py-3" : "py-6",
        className
      )}
    >
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

export function MessageContent({
  from,
  className,
  children,
}: MessageContentProps) {
  const isUser = from === "user";

  return (
    <div
      className={cn(
        "flex flex-col gap-2 relative",
        isUser
          ? "bg-muted/80 w-fit max-w-[85%] px-5 py-3.5 rounded-3xl rounded-tr-sm"
          : "flex-1 min-w-0 w-full",
        className
      )}
    >
      <div
        className={cn(
          "text-base leading-relaxed font-sans",
          isUser ? "text-foreground" : "text-foreground"
        )}
      >
        {children}
      </div>
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
        "[&_a]:underline [&_a]:underline-offset-4 [&_a]:text-primary [&_a]:transition-colors hover:[&_a]:text-primary/80",
        "[&_code]:rounded-md [&_code]:bg-muted/60 [&_code]:px-1.5 [&_code]:py-0.5",
        "[&_code]:text-[0.9em] [&_code]:font-[family-name:var(--font-geist-mono)]",
        "[&_pre]:rounded-2xl [&_pre]:border [&_pre]:border-border/50 [&_pre]:bg-muted/30",
        "[&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:text-sm",
        "[&_p]:mb-4 [&_p:last-child]:mb-0",
        "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-6 [&_h1]:mt-8",
        "[&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-4 [&_h2]:mt-6",
        "[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-3 [&_h3]:mt-5",
        "[&_ul]:pl-5 [&_ul]:space-y-2 [&_ol]:pl-5 [&_ol]:space-y-2",
        "[&_li]:marker:text-muted-foreground",
        "[&_blockquote]:border-l-4 [&_blockquote]:border-primary/50 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground",
        "[&_table]:w-full [&_table]:text-sm [&_th]:border-b [&_td]:border-b [&_th]:py-3 [&_th]:px-4 [&_th]:text-left [&_td]:py-3 [&_td]:px-4",
        "[&_table]:mb-6",
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

export function MessageAttachments({
  className,
  children,
}: MessageAttachmentsProps) {
  return (
    <div className={cn("flex flex-wrap gap-2 mt-1", className)}>{children}</div>
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
        <img src={url} alt={name} className="max-h-40 max-w-xs object-cover" />
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
