"use client";

import { useRef, useEffect, useState } from "react";
import { useChat, useAutoResize, useAutoScroll, useKeyboardShortcuts } from "@/lib/hooks";
import { AGENTS } from "@/lib/agents";
import { cn } from "@/lib/utils";
import type { ChatMode } from "@/lib/types";
import { AgentSwitcher } from "../agent-switcher";
import { ActivityPanel } from "../activity/activity-panel";
import { ChatHeader } from "./chat-header";
import { UserMessage, AssistantMessage, WelcomeMessage } from "./message-components";
import { LoadingIndicator } from "./loading-indicator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, RefreshCw, X, Activity } from "lucide-react";

const WELCOME_MESSAGE = `Hello! I'm @duyetbot - a virtual version of Duyet. I can help you with:

- **Blog Search** — Search through 296+ blog posts on data engineering, cloud computing, and programming
- **CV Information** — Learn about Duyet's experience and skills
- **GitHub Activity** — See recent commits, PRs, and issues
- **Analytics** — View contact form statistics

What would you like to know?`;

export function VercelChat() {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isActivityMinimized, setIsActivityMinimized] = useState(false);
  const [showMobileActivity, setShowMobileActivity] = useState(false);

  const {
    messages,
    input,
    setInput,
    handleSubmit,
    isLoading,
    streamingContent,
    error,
    stop,
    reload,
    activeAgent,
    setActiveAgent,
    toolExecutions,
    thinkingSteps,
    mode,
    setMode,
  } = useChat({
    onError: (err) => console.error("Chat error:", err),
  });

  // Sync mode with localStorage (read on mount, write on change)
  useEffect(() => {
    const saved = localStorage.getItem("chat-mode") as ChatMode;
    if (saved === "fast" || saved === "agent") setMode(saved);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleModeChange = (newMode: ChatMode) => {
    setMode(newMode);
    localStorage.setItem("chat-mode", newMode);
  };

  const handlePromptSelect = (prompt: string) => {
    setInput(prompt);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

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

  const hasActivity = toolExecutions.length > 0 || thinkingSteps.length > 0 || isLoading;

  return (
    <div className="flex h-full flex-col lg:flex-row bg-background">
      {/* Left: Chat Panel */}
      <div className={cn(
        "flex w-full flex-col border-r",
        mode === "agent" && hasActivity && "lg:w-1/2"
      )}>
        {/* Mode toggle header */}
        <ChatHeader mode={mode} onModeChange={handleModeChange} />

        {/* Agent Switcher */}
        <AgentSwitcher
          agents={AGENTS}
          activeAgent={activeAgent}
          onAgentChange={setActiveAgent}
        />

        {/* Messages Area */}
        <ScrollArea className="flex-1 px-4 py-4">
          <div ref={containerRef} className="mx-auto max-w-3xl space-y-4">
            {!hasMessages && !streamingContent ? (
              <WelcomeMessage content={WELCOME_MESSAGE} onPromptSelect={handlePromptSelect} />
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

        {/* Input Area — v0.dev style contained box */}
        <div className="border-t bg-background px-4 py-3">
          <form onSubmit={(e) => handleSubmit(e)} className="mx-auto max-w-2xl">
            <div className={cn(
              "rounded-lg border bg-background transition-shadow",
              "focus-within:ring-1 focus-within:ring-ring"
            )}>
              <Textarea
                ref={(el) => { textareaCallbackRef(el); inputRef.current = el; }}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                disabled={isLoading}
                rows={2}
                className="min-h-[64px] max-h-[160px] resize-none border-0 bg-transparent px-3 pt-3 pb-1 shadow-none focus-visible:ring-0 text-sm"
              />
              {/* Inner toolbar */}
              <div className="flex items-center justify-between px-2 pb-2">
                <div className="flex items-center gap-1">
                  <p className="text-[11px] text-muted-foreground/60 pl-1 font-[family-name:var(--font-geist-mono)]">
                    ↵ send · ⇧↵ newline
                  </p>
                  {mode === "agent" && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs lg:hidden"
                      onClick={() => setShowMobileActivity((v) => !v)}
                    >
                      <Activity className="h-3 w-3 mr-1" />
                      Activity{toolExecutions.length > 0 && ` (${toolExecutions.length})`}
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {isLoading ? (
                    <Button
                      type="button"
                      onClick={stop}
                      size="sm"
                      variant="outline"
                      className="h-7 rounded-md px-2.5 text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Stop
                    </Button>
                  ) : (
                    <>
                      {hasAssistantResponse && (
                        <Button
                          type="button"
                          onClick={() => reload()}
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 rounded-md"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          <span className="sr-only">Regenerate</span>
                        </Button>
                      )}
                      <Button
                        type="submit"
                        disabled={!canSubmit}
                        size="sm"
                        className="h-7 rounded-md px-2.5 text-xs"
                      >
                        <Send className="h-3 w-3 mr-1" />
                        Send
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
            {error && (
              <p className="mt-1.5 text-xs text-destructive pl-1">{error.message}</p>
            )}
          </form>
        </div>
      </div>

      {/* Right: Activity Panel — hidden in fast mode, desktop only */}
      {mode === "agent" && (
        <div className="hidden lg:flex w-1/2 flex-col">
          <ActivityPanel
            executions={toolExecutions}
            thinkingSteps={thinkingSteps}
            isLoading={isLoading}
            isMinimized={isActivityMinimized}
            onToggleMinimize={() => setIsActivityMinimized((v) => !v)}
          />
        </div>
      )}

      {/* Mobile Activity Panel — bottom sheet */}
      {mode === "agent" && showMobileActivity && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 h-72 border-t bg-background shadow-lg">
          <ActivityPanel
            executions={toolExecutions}
            thinkingSteps={thinkingSteps}
            isLoading={isLoading}
            isMinimized={false}
            onToggleMinimize={() => setShowMobileActivity(false)}
          />
        </div>
      )}
    </div>
  );
}
