/**
 * ChatKit Panel Component
 *
 * Main integration component for the OpenAI ChatKit web component.
 * Handles session management, theme configuration, client tools, and error states.
 *
 * Architecture:
 * - Uses custom hooks for session and script management
 * - Registry pattern for client tool handlers
 * - Proper error boundaries and retry logic
 * - Accessibility-first error overlay
 *
 * @module components/ChatKitPanel
 */

"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { ChatKit, useChatKit } from "@openai/chatkit-react";
import {
  STARTER_PROMPTS,
  PLACEHOLDER_INPUT,
  MODELS,
  GREETING,
  CREATE_SESSION_ENDPOINT,
  WORKFLOW_ID,
} from "@/lib/config";
import { ErrorOverlay } from "./ErrorOverlay";
import { ConversationSidebar } from "./ConversationSidebar";
import { createInitialErrors, type ErrorState } from "@/lib/errors";
import { useChatKitSession } from "@/hooks/useChatKitSession";
import { useChatKitScript } from "@/hooks/useChatKitScript";
import { useConversationHistory } from "@/hooks/useConversationHistory";
import {
  executeClientTool,
  type ClientToolInvocation,
  type ClientToolContext,
} from "@/lib/client-tools";
import type { ColorScheme } from "@/hooks/useColorScheme";

/**
 * Represents a fact action from the chat conversation
 *
 * @property type - Action type (currently only 'save' is supported)
 * @property factId - Unique identifier for the fact
 * @property factText - The fact content
 */
export type FactAction = {
  type: "save";
  factId: string;
  factText: string;
};

/**
 * Props for the ChatKitPanel component
 *
 * @property theme - Current color scheme (light or dark)
 * @property onWidgetAction - Callback for widget actions (e.g., saving facts)
 * @property onResponseEnd - Callback when ChatKit completes a response
 * @property onThemeRequest - Callback when theme change is requested via client tool
 */
type ChatKitPanelProps = {
  theme: ColorScheme;
  onWidgetAction: (action: FactAction) => Promise<void>;
  onResponseEnd: () => void;
  onThemeRequest: (scheme: ColorScheme) => void;
};

const isDev =
  typeof process !== "undefined" && process.env.NODE_ENV !== "production";

/**
 * ChatKitPanel Component
 *
 * Main chat interface component that integrates the OpenAI ChatKit web component
 * with custom session management, error handling, and client tool support.
 *
 * @param props - Component props
 * @returns Chat interface UI
 *
 * @example
 * ```tsx
 * <ChatKitPanel
 *   theme="dark"
 *   onWidgetAction={handleFactSave}
 *   onResponseEnd={handleResponseEnd}
 *   onThemeRequest={handleThemeChange}
 * />
 * ```
 */
export function ChatKitPanel({
  theme,
  onWidgetAction,
  onResponseEnd,
  onThemeRequest,
}: ChatKitPanelProps) {
  // Refs for stateful data that doesn't need to trigger re-renders
  const processedFacts = useRef(new Set<string>());
  const lastThreadIdRef = useRef<string | null>(null);

  // Error state management
  const [errors, setErrors] = useState<ErrorState>(() => createInitialErrors());

  // Widget instance key for forcing remounts on retry
  const [widgetInstanceKey, setWidgetInstanceKey] = useState(0);

  // Conversation history management
  const {
    conversations,
    activeThreadId,
    setActiveThreadId,
    upsertConversation,
    deleteConversation,
  } = useConversationHistory();

  /**
   * Updates error state with partial updates
   */
  const setErrorState = useCallback((updates: Partial<ErrorState>) => {
    setErrors((current) => ({ ...current, ...updates }));
  }, []);

  // Workflow configuration check
  const isWorkflowConfigured = Boolean(
    WORKFLOW_ID && !WORKFLOW_ID.startsWith("wf_replace"),
  );

  // Custom hook for managing ChatKit script loading
  const { isReady: isScriptReady } = useChatKitScript({
    onErrorUpdate: setErrorState,
    loadTimeout: 5000,
  });

  // Custom hook for managing ChatKit session
  const { isInitializing: isInitializingSession, getClientSecret } =
    useChatKitSession({
      workflowId: WORKFLOW_ID,
      endpoint: CREATE_SESSION_ENDPOINT,
      onErrorUpdate: setErrorState,
      isWorkflowConfigured,
    });

  /**
   * Resets the chat interface and clears all state
   * Used for error recovery and retry functionality
   */
  const handleResetChat = useCallback(() => {
    processedFacts.current.clear();
    setErrors(createInitialErrors());
    setWidgetInstanceKey((prev) => prev + 1);
  }, []);

  /**
   * Creates client tool context for tool execution
   * Memoized to prevent unnecessary recreations
   */
  const toolContext = useMemo<ClientToolContext>(
    () => ({
      onThemeRequest,
      onWidgetAction,
      processedFacts: processedFacts.current,
      isDev,
    }),
    [onThemeRequest, onWidgetAction],
  );

  /**
   * Handles client tool invocations from ChatKit
   * Uses the registry pattern from lib/client-tools
   */
  const handleClientTool = useCallback(
    async (invocation: ClientToolInvocation) => {
      return executeClientTool(invocation, toolContext);
    },
    [toolContext],
  );

  /**
   * Handles the start of a ChatKit response
   * Clears integration errors as new response begins
   */
  const handleResponseStart = useCallback(() => {
    setErrorState({ integration: null, retryable: false });
  }, [setErrorState]);

  /**
   * Handles thread changes in ChatKit
   * Clears processed facts when switching conversations and tracks thread ID
   */
  const handleThreadChange = useCallback(
    ({ threadId }: { threadId: string | null }) => {
      processedFacts.current.clear();

      // Update active thread ID in conversation history
      setActiveThreadId(threadId);

      // If this is a new thread (not from sidebar selection), add it to history
      if (threadId && threadId !== lastThreadIdRef.current) {
        upsertConversation(threadId, {
          title: "New Conversation",
          preview: undefined,
          messageCount: 0,
        });
      }

      lastThreadIdRef.current = threadId;

      if (isDev) {
        console.debug("[ChatKitPanel] Thread changed:", threadId);
      }
    },
    [setActiveThreadId, upsertConversation],
  );

  /**
   * Handles ChatKit errors
   * Note: ChatKit UI handles error display, this is for logging only
   */
  const handleError = useCallback(({ error }: { error: unknown }) => {
    console.error("[ChatKitPanel] ChatKit error", error);
  }, []);

  // Configure ChatKit with all settings and handlers
  const chatkit = useChatKit({
    api: { getClientSecret },
    theme: {
      colorScheme: theme,
      color: {
        grayscale: {
          hue: 220,
          tint: 6,
          shade: theme === "dark" ? -1 : -4,
        },
        accent: {
          primary: theme === "dark" ? "#f1f5f9" : "#0f172a",
          level: 1,
        },
      },
      radius: "pill",
      density: "compact",
      typography: {
        baseSize: 16,
      },
    },
    startScreen: {
      greeting: GREETING,
      prompts: STARTER_PROMPTS,
    },
    composer: {
      placeholder: PLACEHOLDER_INPUT,
      models: MODELS,
    },
    threadItemActions: {
      feedback: true,
    },
    onClientTool: handleClientTool,
    onResponseEnd,
    onResponseStart: handleResponseStart,
    onThreadChange: handleThreadChange,
    onError: handleError,
  });

  /**
   * Handles conversation selection from sidebar
   */
  const handleSelectConversation = useCallback(
    async (threadId: string | null) => {
      if (!chatkit.setThreadId) {
        console.error("[ChatKitPanel] setThreadId method not available");
        return;
      }

      try {
        await chatkit.setThreadId(threadId);

        if (isDev) {
          console.debug(
            "[ChatKitPanel] Switched to conversation:",
            threadId || "new chat",
          );
        }
      } catch (error) {
        console.error("[ChatKitPanel] Failed to switch conversation:", error);
      }
    },
    [chatkit],
  );

  /**
   * Handles conversation deletion from sidebar
   */
  const handleDeleteConversation = useCallback(
    (threadId: string) => {
      deleteConversation(threadId);

      // If deleting the active conversation, switch to new chat
      if (activeThreadId === threadId) {
        handleSelectConversation(null);
      }
    },
    [deleteConversation, activeThreadId, handleSelectConversation],
  );

  // Determine which error to show (script errors block everything)
  const activeError = errors.session ?? errors.integration;
  const blockingError = errors.script ?? activeError;

  // Determine if we should show the ChatKit component
  const shouldShowChatKit =
    !blockingError && !isInitializingSession && isScriptReady;

  // Development logging
  if (isDev) {
    console.debug("[ChatKitPanel] render state", {
      isInitializingSession,
      isScriptReady,
      hasControl: Boolean(chatkit.control),
      hasError: Boolean(blockingError),
      workflowId: WORKFLOW_ID,
    });
  }

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-white transition-colors dark:bg-slate-900">
      {/* Conversation History Sidebar */}
      <ConversationSidebar
        conversations={conversations}
        activeThreadId={activeThreadId}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
      />

      {/* ChatKit Web Component */}
      <ChatKit
        key={widgetInstanceKey}
        control={chatkit.control}
        className={
          shouldShowChatKit
            ? "block h-full w-full"
            : "pointer-events-none opacity-0"
        }
      />

      {/* Error/Loading Overlay */}
      <ErrorOverlay
        error={blockingError}
        fallbackMessage={
          blockingError || !isInitializingSession
            ? null
            : "Loading assistant session..."
        }
        onRetry={blockingError && errors.retryable ? handleResetChat : null}
        retryLabel="Restart chat"
      />
    </div>
  );
}
