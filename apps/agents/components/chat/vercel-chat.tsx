"use client";

import { useRef, useEffect } from "react";
import { useChat, useAutoResize, useAutoScroll, useKeyboardShortcuts } from "@/lib/hooks";
import { ChatHeader } from "./chat-header";
import { UserMessage, AssistantMessage, WelcomeMessage } from "./message-components";
import { LoadingIndicator } from "./loading-indicator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, RefreshCw, X } from "lucide-react";

const WELCOME_MESSAGE = `Hello! I'm @duyetbot - a virtual version of Duyet. I can help you with:

• **Blog Search** - Search through 296+ blog posts on data engineering, cloud computing, and programming
• **CV Information** - Learn about Duyet's experience and skills
• **GitHub Activity** - See recent commits, PRs, and issues
• **Analytics** - View contact form statistics

What would you like to know?`;

export function VercelChat() {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, input, setInput, handleSubmit, isLoading, streamingContent, error, stop, reload } =
    useChat({
      onError: (err) => console.error("Chat error:", err),
    });

  // Auto-resize textarea on input
  const { ref: textareaCallbackRef, resize } = useAutoResize({
    maxHeight: 200,
    minHeight: 44,
  });

  // Auto-scroll on new messages or streaming content
  const { containerRef, scrollToBottom } = useAutoScroll({
    trigger: `${messages.length}-${streamingContent.length}`,
  });

  // Also scroll when streaming starts
  useEffect(() => {
    if (streamingContent) scrollToBottom();
  }, [streamingContent, scrollToBottom]);

  // Keyboard shortcuts
  useKeyboardShortcuts(
    {
      onFocusInput: () => inputRef.current?.focus(),
      onStop: isLoading ? stop : undefined,
      onClearInput: () => {
        setInput("");
        resize();
      },
    },
    { enabled: true }
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const hasMessages = messages.length > 0;
  const hasAssistantResponse = messages.some((m) => m.role === "assistant");
  const canSubmit = input.trim().length > 0 && !isLoading;

  return (
    <div className="flex h-full flex-col bg-background">
      <ChatHeader />

      <ScrollArea className="flex-1 px-4 py-6">
        <div ref={containerRef} className="mx-auto max-w-3xl space-y-6">
          {!hasMessages && !streamingContent ? (
            <WelcomeMessage content={WELCOME_MESSAGE} />
          ) : (
            messages.map((message) =>
              message.role === "user" ? (
                <UserMessage key={message.id} message={message} />
              ) : (
                <AssistantMessage key={message.id} message={message} />
              )
            )
          )}

          {/* Live streaming content */}
          {streamingContent && (
            <AssistantMessage
              message={{
                id: "streaming",
                role: "assistant",
                content: streamingContent,
                timestamp: Date.now(),
              }}
              isStreaming
            />
          )}

          {/* Loading dots (before streaming starts) */}
          {isLoading && !streamingContent && <LoadingIndicator />}
        </div>
      </ScrollArea>

      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <form onSubmit={(e) => handleSubmit(e)} className="mx-auto max-w-3xl p-4">
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <Textarea
                ref={(el) => {
                  textareaCallbackRef(el);
                  inputRef.current = el;
                }}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                disabled={isLoading}
                rows={1}
                className="min-h-[44px] max-h-[200px] resize-none"
              />
            </div>

            {isLoading ? (
              <Button
                type="button"
                onClick={stop}
                size="icon"
                variant="destructive"
                className="h-[44px] w-[44px] shrink-0"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Stop generation</span>
              </Button>
            ) : (
              <>
                {hasAssistantResponse && (
                  <Button
                    type="button"
                    onClick={() => reload()}
                    size="icon"
                    variant="outline"
                    className="h-[44px] w-[44px] shrink-0"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span className="sr-only">Regenerate response</span>
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={!canSubmit}
                  size="icon"
                  className="h-[44px] w-[44px] shrink-0"
                >
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send message</span>
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-muted-foreground">
              Powered by Cloudflare Workers AI • Press{" "}
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">⌘K</kbd> to focus •{" "}
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">Esc</kbd> to stop
            </p>
            {error && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <span>!</span>
                {error.message}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
