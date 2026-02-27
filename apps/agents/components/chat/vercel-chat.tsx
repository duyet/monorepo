"use client";

import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import {
  useChat,
  useAutoResize,
  useAutoScroll,
  useKeyboardShortcuts,
  useMergeRefs,
  useConversations,
} from "@/lib/hooks";
import { cn } from "@duyet/libs";
import type { ChatMode } from "@/lib/types";
import type { UIMessage } from "ai";
import { ActivityPanel } from "../activity/activity-panel";
import {
  UserMessage,
  AssistantMessage,
  WelcomeMessage,
} from "./message-components";
import { LoadingIndicator } from "./loading-indicator";
import { ChatTopBar } from "./chat-top-bar";
import { Sidebar } from "../sidebar/sidebar";
import { AppLayout } from "../layout/app-layout";
import { Button, Textarea } from "@duyet/components";
import { Send, RefreshCw, X, Zap, Wrench } from "lucide-react";

export function VercelChat() {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Layout state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);

  // Conversation management
  const {
    conversations,
    activeId,
    activeConversation,
    createNew,
    switchTo,
    remove,
    updateTitle,
  } = useConversations();

  const {
    messages,
    uiMessages,
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
    addToolApprovalResponse,
  } = useChat({
    onError: (err) => console.error("Chat error:", err),
  });

  // Build a map from message ID → UIMessage parts for inline tool rendering
  const partsMap = useMemo(() => {
    const map = new Map<string, UIMessage["parts"]>();
    for (const msg of uiMessages) {
      if (msg.role === "assistant") {
        map.set(msg.id, msg.parts);
      }
    }
    return map;
  }, [uiMessages]);

  // Approval handlers
  const handleToolApprove = useCallback(
    (approvalId: string) => {
      addToolApprovalResponse({ id: approvalId, approved: true });
    },
    [addToolApprovalResponse]
  );

  const handleToolDeny = useCallback(
    (approvalId: string, reason?: string) => {
      addToolApprovalResponse({ id: approvalId, approved: false, reason });
    },
    [addToolApprovalResponse]
  );

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
    // Auto-create conversation if none active
    if (!activeId) {
      createNew(mode);
    }
    setInput(prompt);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  // Auto-create conversation on first message submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    let convId = activeId;
    if (!convId) {
      convId = createNew(mode);
    }

    // Update title with first user message if it's still "New chat"
    if (
      activeConversation?.title === "New chat" ||
      messages.length === 0
    ) {
      updateTitle(convId, input);
    }

    handleSubmit(e);
  };

  const handleNewChat = () => {
    console.log("[VercelChat] New chat button clicked, mode:", mode);
    createNew(mode);
    console.log("[VercelChat] createNew called, activeId:", activeId);
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
      handleFormSubmit(e);
    }
  };

  const hasMessages = messages.length > 0;
  const hasAssistantResponse = messages.some((m) => m.role === "assistant");
  const canSubmit = input.trim().length > 0 && !isLoading;
  const hasActivity = toolExecutions.length > 0;

  // Auto-show activity panel on first tool execution
  useEffect(() => {
    if (hasActivity && !panelOpen) {
      setPanelOpen(true);
    }
  }, [hasActivity]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sidebar component
  const sidebarContent = (
    <Sidebar
      conversations={conversations}
      activeId={activeId}
      onNewChat={handleNewChat}
      onSelectConversation={switchTo}
      onDeleteConversation={remove}
      collapsed={!sidebarOpen}
      onToggleCollapse={() => setSidebarOpen((v) => !v)}
    />
  );

  // Activity panel (only rendered when there's data)
  const activityContent = hasActivity ? (
    <ActivityPanel
      executions={toolExecutions}
      thinkingSteps={thinkingSteps}
      isLoading={isLoading}
      onClose={() => setPanelOpen(false)}
    />
  ) : null;

  return (
    <AppLayout
      sidebar={sidebarContent}
      panel={activityContent}
      sidebarOpen={sidebarOpen}
      onSidebarOpenChange={setSidebarOpen}
      panelOpen={panelOpen}
      onPanelOpenChange={setPanelOpen}
    >
      {/* Chat top bar */}
      <ChatTopBar
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        onToggleActivity={() => setPanelOpen((v) => !v)}
        onNewChat={handleNewChat}
        showActivityButton={hasActivity}
        activityCount={toolExecutions.length}
        conversationTitle={activeConversation?.title}
      />

      {/* Messages area */}
      <div ref={containerRef} className="flex-1 overflow-y-auto">
        {!hasMessages && !streamingContent ? (
          <div className="mx-auto max-w-3xl px-3 sm:px-4">
            <WelcomeMessage onPromptSelect={handlePromptSelect} />
          </div>
        ) : (
          <div className="mx-auto max-w-3xl px-3 sm:px-4 py-6 space-y-4">
            {messages.map((message) =>
              message.role === "user" ? (
                <UserMessage key={message.id} message={message} />
              ) : (
                <AssistantMessage
                  key={message.id}
                  message={message}
                  parts={partsMap.get(message.id)}
                  onToolApprove={handleToolApprove}
                  onToolDeny={handleToolDeny}
                />
              )
            )}

            {/* Streaming assistant message or loading dots */}
            {isLoading &&
              (() => {
                const lastUiMsg = uiMessages[uiMessages.length - 1];
                if (!lastUiMsg || lastUiMsg.role !== "assistant") {
                  return <LoadingIndicator />;
                }
                return (
                  <AssistantMessage
                    message={{
                      id: "streaming",
                      role: "assistant",
                      content: streamingContent,
                      timestamp: Date.now(),
                    }}
                    parts={lastUiMsg.parts}
                    onToolApprove={handleToolApprove}
                    onToolDeny={handleToolDeny}
                    isStreaming
                  />
                );
              })()}
          </div>
        )}
      </div>

      {/* Sticky input area */}
      <div className="border-t border-border bg-background px-3 sm:px-4 py-3 shadow-[0_-1px_3px_rgba(0,0,0,0.05)] pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <form onSubmit={handleFormSubmit} className="mx-auto max-w-3xl">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about Duyet..."
            disabled={isLoading}
            rows={1}
            className="min-h-[44px] max-h-[160px] resize-none rounded-xl text-sm"
          />
          {/* Input toolbar */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <ModeToggle mode={mode} onModeChange={handleModeChange} />
              <p className="text-[11px] text-muted-foreground font-[family-name:var(--font-geist-mono)] hidden sm:block">
                ↵ send · ⇧↵ newline
              </p>
            </div>
            <div className="flex items-center gap-1">
              {isLoading ? (
                <Button
                  type="button"
                  onClick={stop}
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-full px-4 text-xs"
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
                      className="h-8 w-8 rounded-full"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span className="sr-only">Regenerate</span>
                    </Button>
                  )}
                  <Button
                    type="submit"
                    disabled={!canSubmit}
                    size="sm"
                    className="h-8 rounded-full px-4 text-xs"
                  >
                    <Send className="h-3 w-3 mr-1" />
                    Send
                  </Button>
                </>
              )}
            </div>
          </div>
          {error && (
            <p className="mt-2 text-xs text-destructive pl-2">
              {error.message}
            </p>
          )}
        </form>
      </div>
    </AppLayout>
  );
}

/** Compact mode toggle pills — Fast / Agent */
function ModeToggle({
  mode,
  onModeChange,
}: {
  mode: ChatMode;
  onModeChange: (m: ChatMode) => void;
}) {
  return (
    <div className="flex items-center rounded-full border border-border bg-muted/40 p-0.5 gap-0.5">
      <button
        type="button"
        onClick={() => onModeChange("fast")}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all duration-200",
          mode === "fast"
            ? "bg-amber-100 text-amber-700 shadow-sm dark:bg-amber-900/30 dark:text-amber-400"
            : "text-muted-foreground hover:text-foreground"
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
            ? "bg-blue-100 text-blue-700 shadow-sm dark:bg-blue-900/30 dark:text-blue-400"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Wrench className="h-3 w-3" />
        Agent
      </button>
    </div>
  );
}
