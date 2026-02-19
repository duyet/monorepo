import type { Message } from "@/lib/types";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
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
    <div className="flex justify-end gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 group">
      <div className="flex max-w-[85%] flex-col items-end gap-1">
        <div className="rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-primary-foreground shadow-sm">
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {message.content}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(message.timestamp)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            <span className="sr-only">Copy message</span>
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
    <div className="flex justify-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 group">
      <Avatar className="mt-0.5 shrink-0">
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
          @
        </AvatarFallback>
      </Avatar>
      <div className="flex max-w-[85%] flex-col gap-1">
        <div className="rounded-2xl rounded-bl-sm border bg-background px-4 py-2.5 shadow-sm">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <Markdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSanitize]}
              components={{
                a: ({ ...props }) => (
                  <a
                    {...props}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors underline-offset-2"
                  />
                ),
                code: ({ ...props }) => (
                  <code
                    {...props}
                    className="px-1.5 py-0.5 bg-muted rounded text-sm font-mono"
                  />
                ),
                pre: ({ ...props }) => (
                  <pre
                    {...props}
                    className="bg-muted-foreground/10 text-foreground p-4 rounded-xl overflow-x-auto text-sm border border-border/50"
                  />
                ),
                p: ({ ...props }) => (
                  <p {...props} className="mb-2 last:mb-0" />
                ),
                ul: ({ ...props }) => (
                  <ul {...props} className="mb-2 last:mb-0 space-y-1 pl-4" />
                ),
                ol: ({ ...props }) => (
                  <ol {...props} className="mb-2 last:mb-0 space-y-1 pl-4" />
                ),
              }}
            >
              {message.content}
            </Markdown>
          </div>
          {isStreaming && <StreamingCursor />}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
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
              <span className="sr-only">Copy message</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function StreamingCursor() {
  return (
    <span className="inline-flex ml-1 animate-pulse">
      <span className="w-0.5 h-4 bg-foreground" />
    </span>
  );
}

interface WelcomeMessageProps {
  content: string;
}

export function WelcomeMessage({ content }: WelcomeMessageProps) {
  return (
    <div className="flex justify-center animate-in fade-in zoom-in-95 duration-500">
      <div className="max-w-lg text-center space-y-4 px-4">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg">
          <span className="text-white text-xl">@</span>
        </div>
        <h2 className="text-xl font-semibold tracking-tight">
          Welcome to @duyetbot
        </h2>
        <div className="prose prose-sm dark:prose-invert max-w-none mx-auto text-muted-foreground">
          <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
        </div>
      </div>
    </div>
  );
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return "just now";
  } else if (minutes < 60) {
    return `${minutes}m ago`;
  } else if (hours < 24) {
    return `${hours}h ago`;
  } else if (days < 7) {
    return `${days}d ago`;
  } else {
    return new Date(timestamp).toLocaleDateString();
  }
}
