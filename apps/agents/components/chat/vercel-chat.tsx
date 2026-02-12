"use client";

import { useState, useRef, useEffect } from "react";
import { useChat, useAutoResize, useKeyboardShortcuts } from "@/lib/hooks";
import { ChatHeader } from "./chat-header";
import { UserMessage, AssistantMessage, WelcomeMessage } from "./message-components";
import { LoadingIndicator } from "./loading-indicator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Loader2, RefreshCw, X } from "lucide-react";

const WELCOME_MESSAGE = `Hello! I'm @duyetbot - a virtual version of Duyet. I can help you with:

• **Blog Search** - Search through 296+ blog posts on data engineering, cloud computing, and programming
• **CV Information** - Learn about Duyet's experience and skills
• **GitHub Activity** - See recent commits, PRs, and issues
• **Analytics** - View contact form statistics

What would you like to know?`;

const INITIAL_MESSAGE = {
  id: "welcome",
  role: "assistant" as const,
  content: WELCOME_MESSAGE,
  timestamp: Date.now(),
};

export function VercelChat() {
  // Initialize messages with welcome message if empty
  const [initialized, setInitialized] = useState(false);

  // Set up refs and hooks
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const { messages, input, setInput, handleSubmit, isLoading, error, stop, reload } = useChat({
    onFinish: () => {
      scrollToBottom();
    },
    onError: (error) => {
      console.error("Chat error:", error);
    },
  });

  // Initialize with welcome message
  useEffect(() => {
    if (!initialized && messages.length === 0) {
      setInitialized(true);
    }
  }, [initialized, messages]);

  const { textareaRef } = useAutoResize({
    maxHeight: 200,
    minHeight: 44,
  });

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onFocusInput: () => {
      inputRef.current?.focus();
    },
    onStop: isLoading ? stop : undefined,
    onClearInput: () => {
      setInput("");
    },
  }, { enabled: true });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const hasWelcomeMessage = messages.length === 0 || (messages.length === 1 && messages[0]?.id === "welcome");
  const showStopButton = isLoading;
  const canSubmit = input.trim().length > 0 && !isLoading;

  // Display messages - show welcome if only welcome message exists, otherwise filter it out
  const displayMessages = hasWelcomeMessage ? [] : messages.filter((m) => m.id !== "welcome");

  return (
    <div className="flex h-full flex-col bg-background">
      <ChatHeader />

      <ScrollArea className="flex-1 px-4 py-6">
        <div ref={scrollRef} className="mx-auto max-w-3xl space-y-6">
          {hasWelcomeMessage ? (
            <WelcomeMessage content={WELCOME_MESSAGE} />
          ) : (
            displayMessages.map((message) =>
              message.role === "user" ? (
                <UserMessage key={message.id} message={message} />
              ) : (
                <AssistantMessage key={message.id} message={message} />
              )
            )
          )}

          {isLoading && <LoadingIndicator />}
        </div>
      </ScrollArea>

      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <form onSubmit={(e) => handleSubmit(e)} className="mx-auto max-w-3xl p-4">
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <Textarea
                ref={(el) => {
                  if (textareaRef.current !== el) {
                    textareaRef.current = el;
                  }
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

            {showStopButton ? (
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
                {messages.length > 0 && (
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
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span className="sr-only">Send message</span>
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-muted-foreground">
              Powered by Cloudflare Workers AI • Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">⌘K</kbd> to focus • <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">Esc</kbd> to stop
            </p>
            {error && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <span>⚠️</span>
                {error.message}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
