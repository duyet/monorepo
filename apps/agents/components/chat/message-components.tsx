import type { Message } from "@/lib/types";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface MessageProps {
  message: Message;
  isStreaming?: boolean;
}

export function UserMessage({ message }: { message: Message }) {
  return (
    <div className="flex justify-end gap-3">
      <div className="flex max-w-[85%] flex-col items-end gap-1">
        <div className="rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-primary-foreground">
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {message.content}
          </p>
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}

export function AssistantMessage({ message, isStreaming }: MessageProps) {
  return (
    <div className="flex justify-start gap-3">
      <Avatar className="mt-0.5">
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
          AI
        </AvatarFallback>
      </Avatar>
      <div className="flex max-w-[85%] flex-col gap-1">
        <div className="rounded-2xl rounded-bl-sm border bg-background px-4 py-2.5 shadow-sm">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <Markdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ node, ...props }) => (
                  <a
                    {...props}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  />
                ),
                code: ({ node, ...props }) => (
                  <code
                    {...props}
                    className="px-1.5 py-0.5 bg-muted rounded text-sm font-mono"
                  />
                ),
                pre: ({ node, ...props }) => (
                  <pre
                    {...props}
                    className="bg-muted-foreground/10 text-foreground p-4 rounded-xl overflow-x-auto text-sm border border-border/50"
                  />
                ),
                p: ({ node, ...props }) => (
                  <p {...props} className="mb-2 last:mb-0" />
                ),
                ul: ({ node, ...props }) => (
                  <ul {...props} className="mb-2 last:mb-0 space-y-1 pl-4" />
                ),
                ol: ({ node, ...props }) => (
                  <ol {...props} className="mb-2 last:mb-0 space-y-1 pl-4" />
                ),
              }}
            >
              {message.content}
            </Markdown>
          </div>
          {isStreaming && <StreamingCursor />}
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}

export function StreamingCursor() {
  return (
    <span className="inline-flex ml-1">
      <span className="animate-pulse">▋</span>
    </span>
  );
}

interface WelcomeMessageProps {
  content: string;
}

export function WelcomeMessage({ content }: WelcomeMessageProps) {
  return (
    <div className="flex justify-center">
      <div className="max-w-lg text-center space-y-4 px-4">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg">
          <span className="text-white text-xl">✨</span>
        </div>
        <h2 className="text-xl font-semibold tracking-tight">
          Welcome to Duyet's AI Assistant
        </h2>
        <div className="prose prose-sm dark:prose-invert max-w-none mx-auto text-muted-foreground">
          <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
        </div>
      </div>
    </div>
  );
}
