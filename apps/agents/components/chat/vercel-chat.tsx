import type { UIMessage } from "ai";
import { AlertCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { AppSidebar } from "@/components/app-sidebar";
import { RightSidebar } from "@/components/right-sidebar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { SidebarInset } from "@/components/ui/sidebar";
import {
  useAutoResize,
  useChat,
  useConversations,
  useKeyboardShortcuts,
  useMergeRefs,
} from "@/lib/hooks";
import { useClerkAuthToken } from "@/lib/hooks/use-clerk-auth";
import type { ChatMode } from "@/lib/types";
import { ChatInput } from "./chat-input";
import { ChatTopBar } from "./chat-top-bar";
import { LoadingIndicator } from "./loading-indicator";
import {
  AssistantMessage,
  UserMessage,
  WelcomeMessage,
} from "./message-components";

export function VercelChat() {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastInputRef = useRef<string>("");
  const getAuthToken = useClerkAuthToken();

  // Layout state (sidebar handled by SidebarProvider)
  const [rightRailOpen, setRightRailOpen] = useState(false);
  const [serviceError, setServiceError] = useState<string | null>(null);

  // Conversation management (scoped to authenticated user)
  const {
    conversations,
    activeId,
    activeConversation,
    activeMessages,
    isLoading: isConversationsLoading,
    createNew,
    switchTo,
    remove,
    updateTitle,
    updateModel,
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
    modelId,
    setModelId,
    mode,
    setMode,
    addToolApprovalResponse,
  } = useChat({
    id: chatKey ?? undefined,
    modelId: activeConversation?.modelId,
    onError: (err) => {
      console.error("Chat error:", err);
      // Detect service-level errors (e.g. missing API key) from JSON body
      try {
        const parsed = JSON.parse(err.message);
        if (parsed.code === "missing_api_key") {
          setServiceError(
            parsed.message ||
              "The AI service is not configured. Please try again later."
          );
        }
      } catch {
        // Not JSON, normal error
      }
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

  const handleModeChange = (newMode: ChatMode) => {
    setMode(newMode);
    localStorage.setItem("chat-mode", newMode);
  };

  // Sync mode with localStorage (read on mount, write on change)
  useEffect(() => {
    const saved = localStorage.getItem("chat-mode") as ChatMode;
    if (saved === "fast" || saved === "agent") handleModeChange(saved);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePromptSelect = async (prompt: string) => {
    // Auto-create conversation if none active
    if (!activeId) {
      await createNew(mode, modelId);
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
      await createNew(mode, modelId);
    }

    lastInputRef.current = input;
    handleSubmit(e);
  };

  const handleNewChat = async () => {
    await createNew(mode, modelId);
  };

  const handleDeleteAllConversations = async () => {
    await Promise.all(conversations.map((conv) => remove(conv.id)));
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
  const tokenStats = useMemo(
    () =>
      messages.reduce(
        (totals, message) => {
          totals.prompt += message.tokens?.prompt ?? 0;
          totals.completion += message.tokens?.completion ?? 0;
          totals.total += message.tokens?.total ?? 0;
          return totals;
        },
        { prompt: 0, completion: 0, total: 0 }
      ),
    [messages]
  );
  const approvalCount = useMemo(() => {
    let count = 0;
    for (const msg of uiMessages) {
      if (msg.role !== "assistant") continue;
      for (const part of msg.parts) {
        if (
          part.type === "dynamic-tool" &&
          (part.state === "approval-requested" ||
            part.state === "approval-responded")
        ) {
          count += 1;
        }
      }
    }
    return count;
  }, [uiMessages]);
  const handleModelChange = async (value: string) => {
    setModelId(value);
    if (activeId) {
      await updateModel(activeId, value);
    }
  };

  return (
    <>
      {/* shadcn Sidebar — conversation history */}
      <AppSidebar
        conversations={conversations}
        activeId={activeId}
        isLoading={isConversationsLoading}
        onNewChat={handleNewChat}
        onSelectConversation={async (id) => {
          await switchTo(id);
        }}
        onDeleteConversation={remove}
        onDeleteAllConversations={handleDeleteAllConversations}
      />

      {/* Main content area */}
      <SidebarInset>
        <div className="flex flex-1 flex-col overflow-hidden w-full min-h-svh bg-transparent">
          <div className="flex h-full w-full overflow-hidden relative bg-transparent">
            <div className="relative flex flex-1 flex-col min-w-0 overflow-hidden">
              {/* Chat top bar */}
              <ChatTopBar
                onToggleRightSidebar={() => setRightRailOpen(true)}
                onNewChat={handleNewChat}
                conversationTitle={activeConversation?.title}
                conversationId={activeId ?? undefined}
              />

              {/* Service error banner */}
              {serviceError && (
                <div className="absolute inset-x-0 top-14 z-10 px-4 pt-3">
                  <Alert
                    variant="destructive"
                    className="mx-auto max-w-3xl animate-in fade-in slide-in-from-top-2 duration-300"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Service unavailable</AlertTitle>
                    <AlertDescription>{serviceError}</AlertDescription>
                  </Alert>
                </div>
              )}

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
              <ChatInput
                input={input}
                setInput={setInput}
                onSubmit={handleFormSubmit}
                onKeyDown={handleKeyDown}
                isLoading={isLoading}
                canSubmit={canSubmit}
                hasAssistantResponse={hasAssistantResponse}
                stop={stop}
                reload={reload}
                error={error}
                textareaRef={textareaRef}
              />
            </div>
          </div>
        </div>
      </SidebarInset>

      <RightSidebar
        modelId={modelId}
        onModelChange={handleModelChange}
        tokenStats={tokenStats}
        toolExecutions={toolExecutions}
        approvalCount={approvalCount}
        thinkingStepsCount={thinkingSteps.length}
      />

      <Sheet open={rightRailOpen} onOpenChange={setRightRailOpen}>
        <SheetContent side="right" className="w-[360px] p-0 lg:hidden">
          <RightSidebar
            mobile
            modelId={modelId}
            onModelChange={handleModelChange}
            tokenStats={tokenStats}
            toolExecutions={toolExecutions}
            approvalCount={approvalCount}
            thinkingStepsCount={thinkingSteps.length}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
