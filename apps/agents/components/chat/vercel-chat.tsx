"use client";

import { Button, Textarea } from "@duyet/components";
import { cn } from "@duyet/libs";
import type { UIMessage } from "ai";
import { RefreshCw, Send, X, Paperclip, Settings } from "lucide-react";
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
import { AppSidebar } from "@/components/app-sidebar";
import { AppLayout } from "@/components/layout/app-layout";
import { ActivityPanel } from "../activity/activity-panel";
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
  const lastInputRef = useRef<string>("");
  const getAuthToken = useClerkAuthToken();

  // Layout state
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

  // Read conversation id from URL on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlId = new URLSearchParams(window.location.search).get("id");
    if (urlId && urlId !== activeId) {
      void switchTo(urlId).then(() => {
        window.history.replaceState({}, "", window.location.pathname);
      });
    }
  }, [switchTo, activeId]);

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
    onError: (err) => {
      console.error("Chat error:", err);
      if (lastInputRef.current) {
        setInput(lastInputRef.current);
        lastInputRef.current = "";
      }
    },
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

  const _handleModeChange = (newMode: ChatMode) => {
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
        if (!res.ok) {
          updateTitle(convId, userMsg.slice(0, 50));
          return;
        }
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

    lastInputRef.current = input;
    handleSubmit(e);
  };

  const handleNewChat = async () => {
    await createNew(mode);
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

  // Activity panel (only rendered when there's data)
  const activityContent = hasActivity ? (
    <ActivityPanel
      executions={toolExecutions}
      thinkingSteps={thinkingSteps}
      isLoading={isLoading}
      onClose={() => setPanelOpen(false)}
    />
  ) : null;

  const sidebarContent = (
    <AppSidebar
      conversations={conversations}
      activeId={activeId}
      onNewChat={handleNewChat}
      onSelectConversation={async (id) => {
        await switchTo(id);
      }}
      onDeleteConversation={remove}
    />
  );

  return (
    <AppLayout sidebar={sidebarContent}>
      <div className="flex h-full w-full overflow-hidden relative bg-transparent">
        <div className="relative flex flex-1 flex-col min-w-0 overflow-hidden">
          {/* Chat top bar */}
          <ChatTopBar
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
          <div className="w-full pb-40 pt-14">
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
              className="relative flex items-end w-full rounded-[32px] border border-input/50 bg-background focus-within:border-primary/30 focus-within:ring-1 focus-within:ring-primary/30 shadow-md transition-all pointer-events-auto px-2 py-2"
            >
              {/* Left Icons */}
              <div className="flex items-center gap-1 pl-2 pb-1 text-muted-foreground shrink-0 hidden sm:flex">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  disabled
                  title="Coming soon"
                  aria-label="Attachments (coming soon)"
                  className="h-9 w-9 rounded-full hover:bg-muted cursor-not-allowed opacity-50"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center pl-2 pb-1 sm:hidden">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  disabled
                  title="Coming soon"
                  aria-label="Attachments (coming soon)"
                  className="h-9 w-9 rounded-full hover:bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </div>

              {/* Text Area */}
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter your request..."
                disabled={isLoading}
                rows={1}
                className="flex-1 min-h-[44px] max-h-[200px] w-full resize-none border-0 bg-transparent px-3 py-3 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus:outline-none focus:border-0 outline-none shadow-none"
              />

              {/* Right Icons */}
              <div className="flex items-center gap-3 pr-1 pb-1 shrink-0">
                <button 
                  type="button" 
                  disabled
                  title="Coming soon"
                  aria-label="Settings (coming soon)"
                  className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground hover:text-foreground uppercase cursor-not-allowed opacity-50"
                >
                  <Settings className="h-3.5 w-3.5" />
                  MAX
                </button>
                
                <div className="flex items-center gap-1">
                  {isLoading ? (
                    <Button
                      type="button"
                      onClick={stop}
                      size="icon"
                      className="h-9 w-9 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-all"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Stop</span>
                    </Button>
                  ) : (
                    <>
                      {hasAssistantResponse && input.length === 0 && (
                        <Button
                          type="button"
                          onClick={() => reload()}
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
                        >
                          <RefreshCw className="h-4 w-4" />
                          <span className="sr-only">Regenerate</span>
                        </Button>
                      )}
                      {(input.length > 0 || !hasAssistantResponse) && (
                        <Button
                          type="submit"
                          disabled={!canSubmit}
                          size="icon"
                          className={cn(
                            "h-9 w-9 rounded-full transition-all",
                            canSubmit
                              ? "bg-foreground text-background hover:bg-foreground/90"
                              : "bg-muted text-muted-foreground opacity-50"
                          )}
                        >
                          <Send className="h-4 w-4" />
                          <span className="sr-only">Send</span>
                        </Button>
                      )}
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
          </div>
        </div>
        </div>
        
        {/* Right panel logic inline */}
        {activityContent && (
          <>
            <div
              className={cn(
                "hidden lg:block shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out border-l border-border",
                panelOpen ? "w-[300px]" : "w-0"
              )}
            >
              <div className="h-full w-[300px] bg-background">{activityContent}</div>
            </div>
            <div className="lg:hidden block">
              <Sheet open={panelOpen} onOpenChange={setPanelOpen}>
                <SheetContent side="right" className="w-[320px] p-0 bg-background">
                  {activityContent}
                </SheetContent>
              </Sheet>
            </div>
          </>
        )}
      </div>

      {/* Tools panel sheet */}
      <Sheet open={toolsPanelOpen} onOpenChange={setToolsPanelOpen}>
        <SheetContent
          side="right"
          className="w-[320px] p-0 border-l border-border bg-background"
        >
          <ToolsPanel onClose={() => setToolsPanelOpen(false)} />
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}

