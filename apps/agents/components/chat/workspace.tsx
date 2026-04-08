"use client";

import type { UIMessage } from "ai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle } from "lucide-react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  AssistantMessage,
  UserMessage,
  WelcomeMessage,
} from "@/components/chat/message-components";
import { AppSidebar } from "@/components/app-sidebar";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatTopBar } from "@/components/chat/chat-top-bar";
import { LoadingIndicator } from "@/components/chat/loading-indicator";
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

export function ChatWorkspace() {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const lastInputRef = useRef<string>("");
  const activeConversationIdRef = useRef<string | null>(null);
  const getAuthToken = useClerkAuthToken();
  const [leftRailOpen, setLeftRailOpen] = useState(false);
  const [rightRailOpen, setRightRailOpen] = useState(false);
  const [serviceError, setServiceError] = useState<string | null>(null);

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

  const [chatKey, setChatKey] = useState<string | null>(activeId);

  useEffect(() => {
    if (activeId !== chatKey) {
      setChatKey(activeId);
    }
  }, [activeId, chatKey]);

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
    addToolApprovalResponse,
  } = useChat({
    id: chatKey ?? undefined,
    modelId: activeConversation?.modelId,
    mode: "agent",
    onError: (err) => {
      console.error("Chat error:", err);
      if (err instanceof Error) {
        const trimmed = err.message.trim();
        if (trimmed.startsWith("{")) {
          try {
            const parsed = JSON.parse(trimmed);
            if (parsed.code === "missing_api_key") {
              setServiceError(
                parsed.message ||
                  "The AI service is not configured. Please try again later."
              );
            }
          } catch {
            // Not JSON, continue with normal recovery.
          }
        }
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

  const partsMap = useMemo(() => {
    const map = new Map<string, UIMessage["parts"]>();
    for (const msg of uiMessages) {
      if (msg.role === "assistant") {
        map.set(msg.id, msg.parts);
      }
    }
    return map;
  }, [uiMessages]);

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

  const handlePromptSelect = async (prompt: string) => {
    if (!activeId) {
      await createNew("agent", modelId);
    }
    setInput(prompt);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

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
        updateTitle(convId, userMsg.slice(0, 50));
      }
    },
    [updateTitle]
  );

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

  useEffect(() => {
    setTitleGenerated(false);
  }, [activeId]);

  const handleFormSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (!activeId) {
      await createNew("agent", modelId);
    }

    lastInputRef.current = input;
    handleSubmit(e);
  };

  const handleNewChat = async () => {
    await createNew("agent", modelId);
  };

  const handleDeleteAllConversations = async () => {
    await Promise.all(conversations.map((conv) => remove(conv.id)));
  };

  const { ref: textareaCallbackRef, resize } = useAutoResize({
    maxHeight: 220,
    minHeight: 48,
  });
  const textareaRef = useMergeRefs(textareaCallbackRef, inputRef);

  const autoScrollTrigger = messages.length + streamingContent.length;

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
      formRef.current?.requestSubmit();
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
      <SidebarInset>
        <div className="flex min-h-svh flex-col bg-background">
          <ChatTopBar
            conversationId={activeId ?? undefined}
            conversationTitle={activeConversation?.title}
            onNewChat={handleNewChat}
            onToggleLeftSidebar={() => setLeftRailOpen(true)}
            onToggleRightSidebar={() => setRightRailOpen(true)}
            subtitle="Agent workspace"
          />

          <div className="flex min-h-0 flex-1 flex-col">
            <main className="flex min-h-0 min-w-0 flex-col">
              <Conversation
                className="relative flex-1 bg-gradient-to-b from-background to-muted/20"
                autoScrollTrigger={autoScrollTrigger}
              >
                <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
                  {serviceError ? (
                    <Alert
                      variant="destructive"
                      className="mx-auto w-full max-w-3xl animate-in fade-in slide-in-from-top-2 duration-300"
                    >
                      <AlertCircle />
                      <AlertTitle>Service unavailable</AlertTitle>
                      <AlertDescription>{serviceError}</AlertDescription>
                    </Alert>
                  ) : null}
                  {!hasMessages && !streamingContent ? (
                    <ConversationEmptyState>
                      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 pt-8">
                        <WelcomeMessage
                          disabled={!!serviceError}
                          onPromptSelect={handlePromptSelect}
                        />
                      </div>
                    </ConversationEmptyState>
                  ) : (
                    <ConversationContent className="w-full px-0 py-0">
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

                <ConversationScrollButton className="bottom-[118px]" />
              </Conversation>

              <ChatInput
                input={input}
                setInput={setInput}
                formRef={formRef}
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
            </main>
          </div>
        </div>
      </SidebarInset>

      <Sheet open={rightRailOpen} onOpenChange={setRightRailOpen}>
        <SheetContent side="right" className="w-[360px] p-0">
          <RightSidebar
            modelId={modelId}
            onModelChange={handleModelChange}
            tokenStats={tokenStats}
            toolExecutions={toolExecutions}
            approvalCount={approvalCount}
            thinkingStepsCount={thinkingSteps.length}
          />
        </SheetContent>
      </Sheet>

      <Sheet open={leftRailOpen} onOpenChange={setLeftRailOpen}>
        <SheetContent side="left" className="w-[360px] p-0">
          <AppSidebar
            conversations={conversations}
            activeId={activeId}
            isLoading={isConversationsLoading}
            onNewChat={handleNewChat}
            onSelectConversation={async (id) => {
              await switchTo(id);
              setLeftRailOpen(false);
            }}
            onDeleteConversation={remove}
            onDeleteAllConversations={handleDeleteAllConversations}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
