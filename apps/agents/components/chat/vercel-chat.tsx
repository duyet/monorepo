"use client";

import { useRef, useEffect, useState } from "react";
import { useChat, useAutoResize, useAutoScroll, useKeyboardShortcuts, useMergeRefs } from "@/lib/hooks";
import { cn } from "@duyet/libs";
import type { ChatMode } from "@/lib/types";
import { ActivityPanel } from "../activity/activity-panel";
import { UserMessage, AssistantMessage, WelcomeMessage } from "./message-components";
import { LoadingIndicator } from "./loading-indicator";
import { Button, Textarea } from "@duyet/components";
import { Send, RefreshCw, X, Activity, Zap, Wrench } from "lucide-react";

export function VercelChat() {
  const inputRef = useRef<HTMLTextAreaElement>(null);
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
  const textareaRef = useMergeRefs(textareaCallbackRef, inputRef);

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
    <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">

      {/* Welcome state — about-page style hero + cards */}
      {!hasMessages && !streamingContent && (
        <WelcomeMessage onPromptSelect={handlePromptSelect} />
      )}

      {/* Chat state — messages + optional activity panel */}
      {(hasMessages || streamingContent) && (
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Messages column */}
          <div className="min-w-0 flex-1">
            {/* Mode toggle strip */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs text-neutral-500">@duyetbot · online</span>
              </div>
              <ModeToggle mode={mode} onModeChange={handleModeChange} />
            </div>

            {/* Messages card */}
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
              <div
                ref={containerRef}
                className="max-h-[60vh] overflow-y-auto space-y-4 pr-1"
              >
                {messages.map((message) =>
                  message.role === "user" ? (
                    <UserMessage key={message.id} message={message} />
                  ) : (
                    <AssistantMessage key={message.id} message={message} />
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
            </div>
          </div>

          {/* Activity panel — insights-style side card (agent mode + desktop) */}
          {mode === "agent" && (
            <div className="hidden lg:block lg:w-80 lg:shrink-0">
              <div className="sticky top-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-400">
                  Activity
                </p>
                <div className="rounded-3xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden">
                  <ActivityPanel
                    executions={toolExecutions}
                    thinkingSteps={thinkingSteps}
                    isLoading={isLoading}
                    className="border-0"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input area */}
      <div className={cn("mt-6", !hasMessages && "mt-0")}>
        <form onSubmit={handleSubmit}>
          <div className={cn(
            "rounded-3xl border border-neutral-200 bg-white transition-shadow dark:border-neutral-800 dark:bg-neutral-900",
            "focus-within:ring-2 focus-within:ring-neutral-300 dark:focus-within:ring-neutral-600"
          )}>
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about Duyet..."
              disabled={isLoading}
              rows={2}
              className="min-h-[64px] max-h-[160px] resize-none border-0 bg-transparent px-5 pt-4 pb-1 shadow-none focus-visible:ring-0 text-sm text-neutral-900 placeholder:text-neutral-400 dark:text-neutral-100"
            />
            {/* Input toolbar */}
            <div className="flex items-center justify-between px-3 pb-3">
              <div className="flex items-center gap-2">
                {/* Mode toggle visible in input when on welcome screen */}
                {!hasMessages && (
                  <ModeToggle mode={mode} onModeChange={handleModeChange} />
                )}
                <p className="text-[11px] text-neutral-400 font-[family-name:var(--font-geist-mono)]">
                  ↵ send · ⇧↵ newline
                </p>
                {mode === "agent" && hasMessages && (
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
                    className="h-8 rounded-full px-4 text-xs border-neutral-200"
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
                        className="h-8 w-8 rounded-full text-neutral-500 hover:text-neutral-900"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span className="sr-only">Regenerate</span>
                      </Button>
                    )}
                    <Button
                      type="submit"
                      disabled={!canSubmit}
                      size="sm"
                      className="h-8 rounded-full px-4 text-xs bg-neutral-900 text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
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
            <p className="mt-2 text-xs text-red-500 pl-2">{error.message}</p>
          )}
        </form>
      </div>

      {/* Mobile Activity Panel — bottom sheet */}
      {mode === "agent" && showMobileActivity && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 h-72 border-t border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
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

/** Compact mode toggle pills — Fast / Agent */
function ModeToggle({ mode, onModeChange }: { mode: ChatMode; onModeChange: (m: ChatMode) => void }) {
  return (
    <div className="flex items-center rounded-full border border-neutral-200 bg-neutral-100 p-0.5 gap-0.5 dark:border-neutral-700 dark:bg-neutral-800">
      <button
        type="button"
        onClick={() => onModeChange("fast")}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all duration-200",
          mode === "fast"
            ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-neutral-100"
            : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400"
        )}
      >
        <Zap className="h-3 w-3" />
        Fast
      </button>
      <button
        type="button"
        onClick={() => onModeChange("agent")}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all duration-200",
          mode === "agent"
            ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-neutral-100"
            : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400"
        )}
      >
        <Wrench className="h-3 w-3" />
        Agent
      </button>
    </div>
  );
}
