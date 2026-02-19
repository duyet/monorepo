"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { Message, ToolExecution, Agent } from "@/lib/types";
import { getDefaultAgent } from "@/lib/agents";
import {
  parseStreamEvent,
  createToolExecution,
} from "./use-activity";

const CHAT_API_URL =
  process.env.NEXT_PUBLIC_CHAT_API_URL ||
  "https://duyet-agents-api.duyet.workers.dev/chat";

export interface UseChatOptions {
  onError?: (error: Error) => void;
  onFinish?: (message: Message) => void;
}

export interface UseChatReturn {
  messages: Message[];
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  streamingContent: string;
  error: Error | null;
  stop: () => void;
  reload: () => Promise<void>;
  // Agent and activity tracking
  activeAgent: Agent;
  setActiveAgent: (agent: Agent) => void;
  toolExecutions: ToolExecution[];
  thinkingSteps: string[];
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const { onError, onFinish } = options;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [error, setError] = useState<Error | null>(null);
  const [activeAgent, setActiveAgent] = useState<Agent>(getDefaultAgent());
  const [toolExecutions, setToolExecutions] = useState<ToolExecution[]>([]);
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);

  const abortControllerRef = useRef<AbortController | null>(null);
  // Ref mirrors state to avoid stale closures in async callbacks
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const sendRequest = useCallback(
    async (allMessages: Message[]) => {
      setIsLoading(true);
      setStreamingContent("");
      setError(null);

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch(CHAT_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: allMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ error: "Unknown error" }));
          throw new Error(
            errorData.error ||
              `HTTP ${response.status}: ${response.statusText}`
          );
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") continue;

                try {
                  const parsed = JSON.parse(data);
                  if (parsed.response) {
                    fullContent += parsed.response;
                    setStreamingContent(fullContent);
                  }
                } catch {
                  // Skip invalid JSON chunks
                }
              }
            }
          }
        }

        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content:
            fullContent ||
            "I apologize, but I couldn't generate a response. Please try again.",
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        onFinish?.(assistantMessage);
      } catch (err) {
        const chatError =
          err instanceof Error ? err : new Error("Unknown error occurred");

        if (chatError.name === "AbortError") {
          // Preserve any partial streamed content as a message
          const partial = streamingContent;
          if (partial) {
            setMessages((prev) => [
              ...prev,
              {
                id: `assistant-${Date.now()}`,
                role: "assistant",
                content: partial,
                timestamp: Date.now(),
              },
            ]);
          }
        } else {
          console.error("Chat error:", chatError);
          setError(chatError);
          onError?.(chatError);

          setMessages((prev) => [
            ...prev,
            {
              id: `error-${Date.now()}`,
              role: "assistant",
              content: `Sorry, I encountered an error. Please try again.\n\n**Error:** ${chatError.message}`,
              timestamp: Date.now(),
            },
          ]);
        }
      } finally {
        setIsLoading(false);
        setStreamingContent("");
        abortControllerRef.current = null;
      }
    },
    [onError, onFinish, streamingContent]
  );

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();

      const trimmedInput = input.trim();
      if (!trimmedInput || isLoading) return;

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: trimmedInput,
        timestamp: Date.now(),
      };

      const allMessages = [...messagesRef.current, userMessage];
      setMessages(allMessages);
      setInput("");

      await sendRequest(allMessages);
    },
    [input, isLoading, sendRequest]
  );

  const stop = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const reload = useCallback(async () => {
    const currentMessages = messagesRef.current;
    if (currentMessages.length === 0) return;

    const lastUserMessage = [...currentMessages]
      .reverse()
      .find((m) => m.role === "user");
    if (!lastUserMessage) return;

    // Keep messages up to and including the last user message
    const idx = currentMessages.findIndex((m) => m.id === lastUserMessage.id);
    const kept = currentMessages.slice(0, idx + 1);
    setMessages(kept);

    await sendRequest(kept);
  }, [sendRequest]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return {
    messages,
    input,
    setInput,
    handleSubmit,
    isLoading,
    streamingContent,
    error,
    stop,
    reload,
    activeAgent,
    setActiveAgent,
    toolExecutions,
    thinkingSteps,
  };
}
