"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { useChat as useAIChat } from "@ai-sdk/react";
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithApprovalResponses } from "ai";
import type { UIMessage, DynamicToolUIPart, TextUIPart, ChatAddToolApproveResponseFunction } from "ai";
import type { Message, ToolExecution, Agent, ChatMode } from "@/lib/types";
import { getDefaultAgent } from "@/lib/agents";
import { FAST_MODEL, AGENT_MODEL } from "@/lib/agent";

const CHAT_API_URL =
  process.env.NEXT_PUBLIC_CHAT_API_URL || "/api/chat";

export interface UseChatOptions {
  onError?: (error: Error) => void;
  onFinish?: (message: Message) => void;
  mode?: ChatMode;
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
function toExecutionStatus(state: DynamicToolUIPart["state"]): ToolExecution["status"] {
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
  const { onError, onFinish, mode: initialMode = "agent" } = options;

  const [input, setInput] = useState("");
  const [activeAgent, setActiveAgent] = useState<Agent>(getDefaultAgent());
  const [mode, setMode] = useState<ChatMode>(initialMode);

  // Track message start times for duration calculation
  const messageStartTimeRef = useRef<Map<string, number>>(new Map());
  const messageMetadataRef = useRef<Map<string, {
    model: string;
    toolCalls: number;
    startTime: number;
  }>>(new Map());

  // Keep a ref so the transport's body function always reads the latest mode
  const modeRef = useRef(mode);
  modeRef.current = mode;

  // Transport created once; body is evaluated per-request via function
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: CHAT_API_URL,
        body: () => ({ mode: modeRef.current }),
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
    transport,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
    onError,
    onFinish: onFinish
      ? ({ message: msg }) => {
          const content = getTextContent(msg);
          const metadata = messageMetadataRef.current.get(msg.id);
          const startTime = metadata?.startTime || messageStartTimeRef.current.get(msg.id) || Date.now();
          const duration = Date.now() - startTime;

          // Count tool calls from parts
          const toolCalls = msg.parts.filter(p => p.type === "dynamic-tool" || p.type.startsWith("tool-")).length;

          const messageWithMeta: Message = {
            id: msg.id,
            role: "assistant",
            content,
            timestamp: Date.now(),
            model: metadata?.model || (modeRef.current === "fast" ? FAST_MODEL : AGENT_MODEL),
            duration,
            toolCalls,
          };

          console.log("[useChat] Message finished:", {
            id: msg.id,
            contentLength: content.length,
            duration: `${duration}ms`,
            toolCalls,
          });

          onFinish?.(messageWithMeta);
          messageMetadataRef.current.delete(msg.id);
          messageStartTimeRef.current.delete(msg.id);
        }
      : undefined,
  });

  const isActiveStatus = status === "streaming" || status === "submitted";

  // Debug logging for status changes
  useMemo(() => {
    console.log("[useChat] Status changed:", { status, isActiveStatus, messagesCount: aiMessages.length });
  }, [status, aiMessages.length]);

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

  /** Live text of the currently-streaming assistant message */
  const streamingContent = useMemo(() => {
    if (!isActiveStatus) return "";
    const lastMsg = aiMessages[aiMessages.length - 1];
    if (!lastMsg || lastMsg.role !== "assistant") return "";
    const content = getTextContent(lastMsg);
    if (content.length > 0) {
      console.log("[useChat] Streaming content updated:", { length: content.length, preview: content.substring(0, 50) });
    }
    return content;
  }, [aiMessages, isActiveStatus]);

  // Debug: Log UIMessage parts structure
  useMemo(() => {
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
        const toolCallCount = lastMsg.parts.filter(p =>
          p.type === "dynamic-tool" || p.type.startsWith("tool-")
        ).length;
        const currentMeta = messageMetadataRef.current.get(lastMsg.id);
        if (currentMeta) {
          currentMeta.toolCalls = toolCallCount;
        }

        console.log("[useChat] Last UIMessage parts:", {
          id: lastMsg.id,
          role: lastMsg.role,
          partsCount: lastMsg.parts?.length || 0,
          parts: lastMsg.parts?.map(p => {
            const info: any = { type: p.type };
            if (p.type === 'text') info.textLength = p.text?.length;
            if ('state' in p) info.state = p.state;
            if ('toolName' in p) info.toolName = p.toolName;
            return info;
          }),
          toolCalls: toolCallCount,
        });
      }
    }
  }, [aiMessages, isActiveStatus]);

  /** Collect tool executions from DynamicToolUIPart parts across all messages */
  const toolExecutions = useMemo<ToolExecution[]>(() => {
    const executions: ToolExecution[] = [];
    for (const msg of aiMessages) {
      if (msg.role !== "assistant") continue;
      for (const part of msg.parts) {
        if (part.type !== "dynamic-tool") continue;
        const p = part as DynamicToolUIPart;
        const isComplete = p.state === "output-available";
        executions.push({
          id: p.toolCallId,
          toolName: p.toolName,
          parameters: (p.input as Record<string, unknown>) || {},
          startTime: Date.now(),
          endTime: isComplete ? Date.now() : undefined,
          status: toExecutionStatus(p.state),
          result: isComplete ? p.output : undefined,
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
