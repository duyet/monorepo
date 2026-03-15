"use client";

import { useChat as useAIChat } from "@ai-sdk/react";
import type {
  ChatAddToolApproveResponseFunction,
  DynamicToolUIPart,
  TextUIPart,
  UIMessage,
} from "ai";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithApprovalResponses,
} from "ai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AGENT_MODEL, FAST_MODEL } from "@/lib/agent";
import { getDefaultAgent } from "@/lib/agents";
import type { Agent, ChatMode, Message, ToolExecution } from "@/lib/types";

const CHAT_API_URL = process.env.NEXT_PUBLIC_CHAT_API_URL || "/api/chat";

export interface UseChatOptions {
  id?: string;
  onError?: (error: Error) => void;
  onFinish?: (message: Message) => void;
  onMessagesChange?: (messages: Message[]) => void;
  mode?: ChatMode;
  messages?: Message[];
  /** Returns a Clerk session token for authenticated requests */
  getAuthToken?: () => Promise<string | null>;
}

export interface UseChatReturn {
  messages: Message[];
  uiMessages: UIMessage[];
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e?: React.FormEvent) => void;
  isLoading: boolean;
  streamingContent: string;
  error: Error | null;
  stop: () => void;
  reload: () => void;
  // Agent and activity tracking
  activeAgent: Agent;
  setActiveAgent: (agent: Agent) => void;
  toolExecutions: ToolExecution[];
  thinkingSteps: string[];
  mode: ChatMode;
  setMode: (mode: ChatMode) => void;
  // Human-in-the-loop approval
  addToolApprovalResponse: ChatAddToolApproveResponseFunction;
}

/** Extract concatenated text from a UIMessage's TextUIPart parts */
function getTextContent(msg: UIMessage): string {
  return msg.parts
    .filter((p): p is TextUIPart => p.type === "text")
    .map((p) => p.text)
    .join("");
}

/** Map DynamicToolUIPart state to ToolExecution status */
function toExecutionStatus(
  state: DynamicToolUIPart["state"]
): ToolExecution["status"] {
  switch (state) {
    case "output-available":
      return "complete";
    case "input-available":
    case "input-streaming":
    case "approval-requested":
    case "approval-responded":
      return "running";
    case "output-denied":
      return "error";
    default:
      return "error";
  }
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const {
    id,
    onError,
    onFinish,
    onMessagesChange,
    mode: initialMode = "agent",
    messages: initialMessages,
    getAuthToken,
  } = options;

  const [input, setInput] = useState("");
  const [activeAgent, setActiveAgent] = useState<Agent>(getDefaultAgent());
  const [mode, setMode] = useState<ChatMode>(initialMode);

  // Track user settings fetched from Clerk
  const settingsRef = useRef<{
    customInstructions?: string;
    language?: string;
    timezone?: string;
  }>({});

  // Fetch settings once on mount if authenticated
  useEffect(() => {
    if (typeof window !== "undefined" && getAuthToken) {
      getAuthToken()
        .then((token) => {
          if (!token) return;
          return fetch("/api/user/settings", {
            headers: { Authorization: `Bearer ${token}` },
          });
        })
        .then((res) => {
          if (!res) return;
          return res.json();
        })
        .then((data) => {
          if (data && !data.error) {
            settingsRef.current = data;
          }
        })
        .catch(console.error);
    }
  }, [getAuthToken]);

  // Track message start times for duration calculation
  const messageStartTimeRef = useRef<Map<string, number>>(new Map());
  const messageMetadataRef = useRef<
    Map<
      string,
      {
        model: string;
        toolCalls: number;
        startTime: number;
      }
    >
  >(new Map());

  // Keep a ref so the transport's body function always reads the latest mode
  const modeRef = useRef(mode);
  modeRef.current = mode;

  // Keep refs for auth token getter and conversation id
  const getAuthTokenRef = useRef(getAuthToken);
  getAuthTokenRef.current = getAuthToken;
  const idRef = useRef(id);
  idRef.current = id;

  // Transport created once; body and headers are evaluated per-request via functions
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: CHAT_API_URL,
        body: () => ({
          mode: modeRef.current,
          conversationId: idRef.current,
          settings: settingsRef.current,
        }),
        headers: async (): Promise<Record<string, string>> => {
          const tokenFn = getAuthTokenRef.current;
          if (!tokenFn) return {};
          const token = await tokenFn();
          if (!token) return {};
          return { Authorization: `Bearer ${token}` };
        },
      }),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const {
    messages: aiMessages,
    sendMessage,
    stop,
    regenerate,
    status,
    error: aiError,
    addToolApprovalResponse,
  } = useAIChat({
    id,
    transport,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
    messages: initialMessages?.map((m) => ({
      id: m.id,
      role: m.role,
      parts: [{ type: "text", text: m.content }],
    })),
    onError,
    onFinish: onFinish
      ? ({ message: msg }) => {
          const content = getTextContent(msg);
          const metadata = messageMetadataRef.current.get(msg.id);
          const startTime =
            metadata?.startTime ||
            messageStartTimeRef.current.get(msg.id) ||
            Date.now();
          const duration = Date.now() - startTime;

          // Count tool calls from parts
          const toolCalls = msg.parts.filter((p) => {
            const type = p.type as string;
            return type === "dynamic-tool" || type.startsWith("tool-");
          }).length;

          const messageWithMeta: Message = {
            id: msg.id,
            role: "assistant",
            content,
            timestamp: Date.now(),
            model:
              metadata?.model ||
              (modeRef.current === "fast" ? FAST_MODEL : AGENT_MODEL),
            duration,
            toolCalls,
          };

          onFinish?.(messageWithMeta);
          messageMetadataRef.current.delete(msg.id);
          messageStartTimeRef.current.delete(msg.id);
        }
      : undefined,
  });

  const isActiveStatus = status === "streaming" || status === "submitted";

  /**
   * Convert UIMessage[] → Message[].
   * While streaming, the last assistant message is being built — exclude it here
   * and expose its current text via streamingContent instead.
   */
  const messages = useMemo<Message[]>(() => {
    const converted = aiMessages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => {
        const baseMessage = {
          id: m.id,
          role: m.role as "user" | "assistant",
          content: getTextContent(m),
          timestamp: Date.now(),
        };

        // Add metadata for completed assistant messages
        if (m.role === "assistant" && !isActiveStatus) {
          const metadata = messageMetadataRef.current.get(m.id);
          if (metadata) {
            return {
              ...baseMessage,
              model: metadata.model,
              toolCalls: metadata.toolCalls,
            };
          }
        }

        return baseMessage;
      });

    if (
      isActiveStatus &&
      converted.length > 0 &&
      converted[converted.length - 1].role === "assistant"
    ) {
      return converted.slice(0, -1);
    }
    return converted;
  }, [aiMessages, isActiveStatus]);

  // Notify parent when messages change (for persistence to conversations)
  useEffect(() => {
    if (onMessagesChange) {
      onMessagesChange(messages);
    }
  }, [messages, onMessagesChange]);

  /** Live text of the currently-streaming assistant message */
  const streamingContent = useMemo(() => {
    if (!isActiveStatus) return "";
    const lastMsg = aiMessages[aiMessages.length - 1];
    if (!lastMsg || lastMsg.role !== "assistant") return "";
    const content = getTextContent(lastMsg);
    return content;
  }, [aiMessages, isActiveStatus]);

  // Track message metadata and log UIMessage parts structure
  useEffect(() => {
    if (isActiveStatus) {
      const lastMsg = aiMessages[aiMessages.length - 1];
      if (lastMsg && lastMsg.role === "assistant") {
        // Track message start time
        if (!messageStartTimeRef.current.has(lastMsg.id)) {
          messageStartTimeRef.current.set(lastMsg.id, Date.now());
          messageMetadataRef.current.set(lastMsg.id, {
            model: modeRef.current === "fast" ? FAST_MODEL : AGENT_MODEL,
            toolCalls: 0,
            startTime: Date.now(),
          });
        }

        // Count tool calls dynamically
        const toolCallCount = lastMsg.parts.filter((p) => {
          const type = p.type as string;
          return type === "dynamic-tool" || type.startsWith("tool-");
        }).length;
        const currentMeta = messageMetadataRef.current.get(lastMsg.id);
        if (currentMeta) {
          currentMeta.toolCalls = toolCallCount;
        }
      }
    }
  }, [aiMessages, isActiveStatus]);

  const toolTimestampsRef = useRef<Map<string, { start: number; end?: number }>>(new Map());

  /** Collect tool executions from DynamicToolUIPart parts across all messages */
  const toolExecutions = useMemo<ToolExecution[]>(() => {
    const executions: ToolExecution[] = [];
    for (const msg of aiMessages) {
      if (msg.role !== "assistant") continue;
      for (const part of msg.parts) {
        const type = part.type as string;
        if (type !== "dynamic-tool") continue;
        const p = part as any;
        if (!p.toolCallId || !p.toolName) continue;
        const isComplete = p.state === "output-available";

        const timestamps = toolTimestampsRef.current.get(p.toolCallId);
        if (!timestamps) {
          toolTimestampsRef.current.set(p.toolCallId, { start: Date.now() });
        }
        const ts = toolTimestampsRef.current.get(p.toolCallId)!;
        if (isComplete && !ts.end) {
          ts.end = Date.now();
        }

        executions.push({
          id: p.toolCallId,
          toolName: p.toolName,
          parameters: (p.input as Record<string, unknown>) || {},
          startTime: ts.start,
          endTime: isComplete ? ts.end : undefined,
          status: toExecutionStatus(p.state),
          result: isComplete ? (p.output as string) : undefined,
        });
      }
    }
    return executions;
  }, [aiMessages]);

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      const trimmedInput = input.trim();
      if (!trimmedInput || status !== "ready") return;
      setInput("");
      sendMessage({ text: trimmedInput });
    },
    [input, status, sendMessage]
  );

  return {
    messages,
    uiMessages: aiMessages,
    input,
    setInput,
    handleSubmit,
    isLoading: isActiveStatus,
    streamingContent,
    error: aiError ?? null,
    stop,
    reload: regenerate,
    activeAgent,
    setActiveAgent,
    toolExecutions,
    thinkingSteps: [],
    mode,
    setMode,
    addToolApprovalResponse,
  };
}
