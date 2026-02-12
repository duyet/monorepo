/**
 * Custom hook for chat functionality with Cloudflare Workers AI
 * Implements streaming chat with proper error handling and state management
 */

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { Message } from "@/lib/types";

const CHAT_API_URL = process.env.NEXT_PUBLIC_CHAT_API_URL || "https://duyet-agents-api.duyet.workers.dev/chat";

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
  error: Error | null;
  stop: () => void;
  reload: () => Promise<void>;
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const { onError, onFinish } = options;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();

    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    // Create user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmedInput,
      timestamp: Date.now(),
    };

    // Update state
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    // Abort any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(CHAT_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
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
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }
      }

      // Create assistant message
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: fullContent || "I apologize, but I couldn't generate a response. Please try again.",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      onFinish?.(assistantMessage);

    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error occurred");

      if (error.name === "AbortError") {
        // User stopped the generation
        console.log("Chat request aborted by user");
      } else {
        console.error("Chat error:", error);
        setError(error);
        onError?.(error);

        // Add error message to chat
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `Sorry, I encountered an error. Please try again.\n\n**Error:** ${error.message}`,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [input, messages, isLoading, onError, onFinish]);

  const stop = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  }, []);

  const reload = useCallback(async () => {
    if (messages.length === 0) return;

    // Get last user message
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUserMessage) return;

    // Remove messages after the last user message
    const lastUserMessageIndex = messages.findIndex((m) => m.id === lastUserMessage.id);
    const messagesToKeep = messages.slice(0, lastUserMessageIndex + 1);

    setMessages(messagesToKeep);
    setInput(lastUserMessage.content);

    // Resubmit
    await handleSubmit();
  }, [messages, handleSubmit]);

  // Cleanup on unmount
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
    error,
    stop,
    reload,
  };
}
