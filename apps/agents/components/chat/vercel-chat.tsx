"use client";

import { Button, Textarea } from "@duyet/components";
import { cn } from "@duyet/libs";
import type { UIMessage } from "ai";
import { RefreshCw, Send, Wrench, X, Zap } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  useAutoResize,
  useChat,
  useConversations,
  useKeyboardShortcuts,
  useMergeRefs,
} from "@/lib/hooks";
import { useClerkAuthToken } from "@/lib/hooks/use-clerk-auth";
import type { ChatMode } from "@/lib/types";
import { ActivityPanel } from "../activity/activity-panel";
import { AppLayout } from "../layout/app-layout";
import { Sidebar } from "../sidebar/sidebar";
import { ChatTopBar } from "./chat-top-bar";
import { LoadingIndicator } from "./loading-indicator";
import {
  AssistantMessage,
  UserMessage,
  WelcomeMessage,
} from "./message-components";
import { ToolsPanel } from "./tools-panel";

export function VercelChat() {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const getAuthToken = useClerkAuthToken();

  // Layout state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [toolsPanelOpen, setToolsPanelOpen] = useState(false);

  // Conversation management (scoped to authenticated user)
  const {
    conversations,
    activeId,
    activeConversation,
    activeMessages,
    createNew,
    switchTo,
    remove,
    updateTitle,
    saveMessages,
  } = useConversations({ getAuthToken });

  // Track the conversation ID for remounting useChat
  const [chatKey, setChatKey] = useState<string | null>(activeId);

  // Sync chatKey with activeId - when conversation changes, force remount
  useEffect(() => {
    if (activeId !== chatKey) {
      setChatKey(activeId);
    }
  }, [activeId, chatKey]);

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
    id: chatKey ?? undefined,
    onError: (err) => console.error("Chat error:", err),
    messages: activeMessages,
    onMessagesChange: saveMessages,
    getAuthToken,
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

  const handlePromptSelect = async (prompt: string) => {
    // Auto-create conversation if none active
    if (!activeId) {
      await createNew(mode);
    }
    setInput(prompt);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  // Generate title from model after first assistant response
  const generateTitle = useCallback(
    async (convId: string, userMsg: string, assistantMsg: string) => {
      try {
        const res = await fetch("/api/title", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userMessage: userMsg,
            assistantMessage: assistantMsg,
          }),
        });
        const { title } = await res.json();
        if (title && title !== "New chat") {
          updateTitle(convId, title);
        }
      } catch {
        // Fallback: use truncated first message
        updateTitle(convId, userMsg.slice(0, 50));
      }
    },
    [updateTitle]
  );

  // Watch for first assistant response to trigger title generation
  const [titleGenerated, setTitleGenerated] = useState(false);
  useEffect(() => {
    if (titleGenerated || !activeId) return;
    if (activeConversation?.title !== "New chat") return;

    const firstUser = messages.find((m) => m.role === "user");
    const firstAssistant = messages.find((m) => m.role === "assistant");
    if (firstUser && firstAssistant && !isLoading) {
      setTitleGenerated(true);
      generateTitle(activeId, firstUser.content, firstAssistant.content);
    }
  }, [
    messages,
    isLoading,
    activeId,
    activeConversation?.title,
    titleGenerated,
    generateTitle,
  ]);

  // Reset title generation flag on new conversation
  useEffect(() => {
    setTitleGenerated(false);
  }, [activeId]);

  // Auto-create conversation on first message submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (!activeId) {
      await createNew(mode);
    }

    handleSubmit(e);
  };

  const handleNewChat = async () => {
    console.log("[VercelChat] New chat button clicked, mode:", mode);
    await createNew(mode);
    console.log("[VercelChat] createNew called, activeId:", activeId);
  };

  // Auto-resize textarea on input
  const { ref: textareaCallbackRef, resize } = useAutoResize({
    maxHeight: 200,
    minHeight: 44,
  });
  const textareaRef = useMergeRefs(textareaCallbackRef, inputRef);

  // autoScrollTrigger changes whenever new messages arrive or streaming content grows
  const autoScrollTrigger = messages.length + streamingContent.length;

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
      onSelectConversation={async (id) => {
        await switchTo(id);
      }}
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
    <>
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
          onToggleTools={() => setToolsPanelOpen((v) => !v)}
          onNewChat={handleNewChat}
          showActivityButton={hasActivity}
          activityCount={toolExecutions.length}
          conversationTitle={activeConversation?.title}
        />

        {/* Messages area */}
        <Conversation
          className="relative flex-1"
          autoScrollTrigger={autoScrollTrigger}
        >
          <div className="h-full w-full overflow-y-auto pb-40">
            {!hasMessages && !streamingContent ? (
              <ConversationEmptyState>
                <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-12">
                  <WelcomeMessage onPromptSelect={handlePromptSelect} />
                </div>
              </ConversationEmptyState>
            ) : (
              <ConversationContent className="mx-auto max-w-3xl px-4 sm:px-6 w-full">
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
              </ConversationContent>
            )}
          </div>
          <ConversationScrollButton className="bottom-[130px]" />
        </Conversation>

        {/* Floating input area */}
        <div className="absolute bottom-0 w-full bg-gradient-to-t from-background via-background to-transparent pt-8 pb-[max(1.5rem,env(safe-area-inset-bottom))] px-3 sm:px-4 pointer-events-none">
          <div className="mx-auto max-w-3xl">
            <form
              onSubmit={handleFormSubmit}
              className="relative flex flex-col w-full rounded-2xl border border-input bg-background focus-within:outline-none focus-within:ring-1 focus-within:ring-ring transition-all pointer-events-auto"
            >
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about Duyet..."
                disabled={isLoading}
                rows={1}
                className="min-h-[52px] max-h-[200px] w-full resize-none border-0 bg-transparent px-4 py-3.5 text-base focus-visible:ring-0 shadow-none pb-12"
              />

              {/* Input toolbar (bottom row inside the textarea container) */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ModeToggle mode={mode} onModeChange={handleModeChange} />
                </div>
                <div className="flex items-center gap-1">
                  {isLoading ? (
                    <Button
                      type="button"
                      onClick={stop}
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-full text-foreground hover:bg-muted"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Stop</span>
                    </Button>
                  ) : (
                    <>
                      {hasAssistantResponse && (
                        <Button
                          type="button"
                          onClick={() => reload()}
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
                        >
                          <RefreshCw className="h-4 w-4" />
                          <span className="sr-only">Regenerate</span>
                        </Button>
                      )}
                      <Button
                        type="submit"
                        disabled={!canSubmit}
                        size="icon"
                        className={cn(
                          "h-8 w-8 rounded-full transition-all",
                          canSubmit
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "bg-muted text-muted-foreground opacity-50"
                        )}
                      >
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Send</span>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </form>
            {error && (
              <p className="mt-2 text-xs text-destructive text-center font-medium">
                {error.message}
              </p>
            )}
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Duyetbot can make mistakes. Consider verifying important
              information.
            </p>
          </div>
        </div>
      </AppLayout>

      {/* Tools panel sheet */}
      <Sheet open={toolsPanelOpen} onOpenChange={setToolsPanelOpen}>
        <SheetContent
          side="right"
          className="w-[320px] p-0 border-l border-border bg-background"
        >
          <ToolsPanel onClose={() => setToolsPanelOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
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
    <div className="flex items-center gap-1 shrink-0 p-0.5">
      <button
        type="button"
        onClick={() => onModeChange("fast")}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer",
          mode === "fast"
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        )}
      >
        <Zap
          className={cn("h-3.5 w-3.5", mode === "fast" && "text-foreground")}
        />
        Fast
      </button>
      <button
        type="button"
        onClick={() => onModeChange("agent")}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer",
          mode === "agent"
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        )}
      >
        <Wrench
          className={cn("h-3.5 w-3.5", mode === "agent" && "text-foreground")}
        />
        Agent
      </button>
    </div>
  );
}
