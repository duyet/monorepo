import { cjk } from "@streamdown/cjk";
import { code } from "@streamdown/code";
import { math } from "@streamdown/math";
import { mermaid } from "@streamdown/mermaid";
import { File as FileIcon } from "@phosphor-icons/react";
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
        "group flex w-full gap-4 animate-in fade-in duration-300",
        isUser ? "justify-end py-2" : "py-4",
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
        "relative flex flex-col gap-2",
        isUser
          ? "w-fit max-w-[85%] rounded-3xl rounded-tr-sm border border-border/70 bg-muted/60 px-4 py-3 shadow-sm"
          : "w-full min-w-0 flex-1 rounded-3xl border border-border/70 bg-background/90 px-4 py-4 shadow-sm",
        className
      )}
    >
      <div className={cn("text-[15px] leading-7 text-foreground")}>
        {children}
      </div>
    </div>
  );
}

MessageContent.displayName = "MessageContent";

// ─── MessageResponse (Streamdown renderer) ────────────────────────────────────

// Cast needed: mermaid version mismatch between @streamdown/mermaid and streamdown
const streamdownPlugins = { cjk, code, math, mermaid } as Parameters<
  typeof Streamdown
>[0]["plugins"];

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
        "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:opacity-80",
        "[&_code]:rounded-md [&_code]:bg-muted/70 [&_code]:px-1.5 [&_code]:py-0.5",
        "[&_code]:text-[0.9em] [&_code]:font-mono",
        "[&_pre]:overflow-x-auto [&_pre]:rounded-2xl [&_pre]:border [&_pre]:border-border/70 [&_pre]:bg-muted/20 [&_pre]:p-4 [&_pre]:text-sm",
        "[&_p]:mb-4 [&_p:last-child]:mb-0",
        "[&_h1]:mb-6 [&_h1]:mt-8 [&_h1]:text-2xl [&_h1]:font-semibold",
        "[&_h2]:mb-4 [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold",
        "[&_h3]:mb-3 [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-medium",
        "[&_ul]:space-y-2 [&_ul]:pl-5 [&_ol]:space-y-2 [&_ol]:pl-5",
        "[&_li]:marker:text-muted-foreground",
        "[&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground",
        "[&_table]:mb-6 [&_table]:w-full [&_table]:text-sm [&_th]:border-b [&_td]:border-b [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_td]:px-4 [&_td]:py-3",
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
        "flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100",
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
              "flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
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
    <div className={cn("mt-1 flex flex-wrap gap-2", className)}>{children}</div>
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
          "block overflow-hidden rounded-xl border border-border/70 bg-background",
          className
        )}
      >
        <img src={url} alt={name} className="max-h-40 max-w-xs object-cover" />
      </a>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-xl border border-border/70 bg-muted/40 px-2.5 py-1.5 text-xs text-muted-foreground",
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
