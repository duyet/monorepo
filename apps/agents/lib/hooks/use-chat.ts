"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { useChat as useAIChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage, DynamicToolUIPart, TextUIPart } from "ai";
import type { Message, ToolExecution, Agent, ChatMode } from "@/lib/types";
import { getDefaultAgent } from "@/lib/agents";

const CHAT_API_URL =
  process.env.NEXT_PUBLIC_CHAT_API_URL || "/api/chat";

export interface UseChatOptions {
  onError?: (error: Error) => void;
  onFinish?: (message: Message) => void;
  mode?: ChatMode;
}

export interface UseChatReturn {
  messages: Message[];
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
}

/** Extract concatenated text from a UIMessage's TextUIPart parts */
function getTextContent(msg: UIMessage): string {
  return msg.parts
    .filter((p): p is TextUIPart => p.type === "text")
    .map((p) => p.text)
    .join("");
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const { onError, onFinish, mode: initialMode = "agent" } = options;

  const [input, setInput] = useState("");
  const [activeAgent, setActiveAgent] = useState<Agent>(getDefaultAgent());
  const [mode, setMode] = useState<ChatMode>(initialMode);

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
  } = useAIChat({
    transport,
    onError,
    onFinish: onFinish
      ? ({ message: msg }) => {
          onFinish({
            id: msg.id,
            role: "assistant",
            content: getTextContent(msg),
            timestamp: Date.now(),
          });
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
      .map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: getTextContent(m),
        timestamp: Date.now(),
      }));

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
    return getTextContent(lastMsg);
  }, [aiMessages, isActiveStatus]);

  /** Collect tool executions from DynamicToolUIPart parts across all messages */
  const toolExecutions = useMemo<ToolExecution[]>(() => {
    const executions: ToolExecution[] = [];
    for (const msg of aiMessages) {
      if (msg.role !== "assistant") continue;
      for (const part of msg.parts) {
        if (part.type !== "dynamic-tool") continue;
        const p = part as DynamicToolUIPart;
        const execStatus: ToolExecution["status"] =
          p.state === "output-available"
            ? "complete"
            : p.state === "input-available" || p.state === "input-streaming"
              ? "running"
              : "error";
        executions.push({
          id: p.toolCallId,
          toolName: p.toolName,
          parameters: (p.input as Record<string, unknown>) || {},
          startTime: Date.now(),
          endTime: p.state === "output-available" ? Date.now() : undefined,
          status: execStatus,
          result: p.state === "output-available" ? p.output : undefined,
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

  const reload = useCallback(() => {
    regenerate();
  }, [regenerate]);

  return {
    messages,
    input,
    setInput,
    handleSubmit,
    isLoading: isActiveStatus,
    streamingContent,
    error: aiError ?? null,
    stop,
    reload,
    activeAgent,
    setActiveAgent,
    toolExecutions,
    thinkingSteps: [],
    mode,
    setMode,
  };
}
