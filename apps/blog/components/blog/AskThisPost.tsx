"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X, Send, MessageCircle } from "lucide-react";
import { cn } from "@duyet/libs/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AskThisPostProps {
  content: string;
  suggestedQuestions?: string[];
}

const defaultQuestions = [
  "What's the main takeaway?",
  "Explain this in simpler terms",
  "What tools are mentioned?",
];

/**
 * AskThisPost - Floating chat component for post-specific Q&A
 * Features:
 * - Floating button with sparkle icon
 * - Expandable panel with message history
 * - Suggested questions as clickable chips
 * - AI SDK streaming response support
 * - Max 10 messages per session
 * - Mobile responsive
 * - Dark mode support
 */
export function AskThisPost({
  content,
  suggestedQuestions = defaultQuestions,
}: AskThisPostProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [modelName, setModelName] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const messageCount = messages.length;
  const hasReachedLimit = messageCount >= 10;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
    textareaRef.current?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading || hasReachedLimit) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "chat",
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: content,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      // Get model name from header
      const model = response.headers.get("X-Model") || "AI";
      setModelName(model);

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let assistantContent = "";
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
      };

      setMessages((prev) => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantContent += chunk;

        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.role === "assistant") {
            lastMessage.content = assistantContent;
          }
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Sorry, I encountered an error while processing your question. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-40",
          "flex items-center gap-2 px-4 py-3",
          "rounded-full font-medium text-sm",
          "bg-gradient-to-r from-terracotta to-terracotta-light dark:from-terracotta dark:to-terracotta/80",
          "text-white shadow-lg hover:shadow-xl",
          "transition-all duration-200",
          "md:bottom-8 md:right-8"
        )}
      >
        <Sparkles className="w-4 h-4" />
        <span>Ask</span>
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
            />

            {/* Chat Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "fixed z-50",
                "w-full h-screen md:w-96 md:h-[600px]",
                "bottom-0 right-0 md:bottom-24 md:right-8",
                "flex flex-col rounded-t-3xl md:rounded-3xl",
                "bg-white dark:bg-gray-900 shadow-2xl",
                "overflow-hidden"
              )}
            >
              {/* Header */}
              <div
                className={cn(
                  "flex items-center justify-between p-4 md:p-6",
                  "border-b border-gray-200 dark:border-gray-700",
                  "bg-gradient-to-r from-terracotta-light/20 to-lavender-light/20",
                  "dark:from-terracotta/10 dark:to-lavender/10"
                )}
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-terracotta dark:text-terracotta-light" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Ask This Post
                  </h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "p-1 rounded-lg transition-colors",
                    "hover:bg-gray-200 dark:hover:bg-gray-800"
                  )}
                  aria-label="Close chat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages Area */}
              <div
                className={cn(
                  "flex-1 overflow-y-auto p-4 md:p-6 space-y-4",
                  "bg-white dark:bg-gray-900"
                )}
              >
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-terracotta-light/20 dark:bg-terracotta/10 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-terracotta dark:text-terracotta-light" />
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                        Ask me anything about this post
                      </p>
                      <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                        Click a suggestion or type a question
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "flex",
                          message.role === "user"
                            ? "justify-end"
                            : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-xs px-3 py-2 rounded-2xl text-sm leading-relaxed",
                            message.role === "user"
                              ? cn(
                                  "bg-terracotta text-white rounded-br-none",
                                  "dark:bg-terracotta/80"
                                )
                              : cn(
                                  "bg-gray-100 text-gray-900 rounded-bl-none",
                                  "dark:bg-gray-800 dark:text-gray-100"
                                )
                          )}
                        >
                          {message.content}
                        </div>
                      </motion.div>
                    ))}
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-1"
                      >
                        <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600 animate-bounce" />
                        <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600 animate-bounce delay-100" />
                        <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600 animate-bounce delay-200" />
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Suggested Questions (shown only when empty) */}
              {messages.length === 0 && (
                <div className="px-4 md:px-6 pb-4 space-y-2">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedQuestion(question)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-xl text-sm",
                        "bg-gray-100 dark:bg-gray-800",
                        "text-gray-700 dark:text-gray-300",
                        "hover:bg-gray-200 dark:hover:bg-gray-700",
                        "transition-colors duration-150",
                        "border border-gray-200 dark:border-gray-700"
                      )}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              )}

              {/* Input Area */}
              <form
                onSubmit={handleSubmit}
                className={cn(
                  "border-t border-gray-200 dark:border-gray-700",
                  "bg-white dark:bg-gray-900 p-4 md:p-6"
                )}
              >
                {hasReachedLimit && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 px-3">
                    Message limit reached for this session
                  </p>
                )}

                {/* Model name footer */}
                {modelName && messages.length > 0 && (
                  <div className="text-xs text-gray-400 dark:text-gray-500 mb-2 px-1 flex items-center gap-1">
                    <Sparkles size={10} className="text-terracotta/60" />
                    {modelName.split("/").pop()?.replace(":free", "") || modelName}
                  </div>
                )}

                <div className="flex gap-2">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        !e.shiftKey &&
                        !hasReachedLimit
                      ) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    placeholder={
                      hasReachedLimit
                        ? "Session limit reached"
                        : "Ask a question..."
                    }
                    disabled={isLoading || hasReachedLimit}
                    className={cn(
                      "flex-1 px-3 py-2 rounded-2xl text-sm",
                      "bg-gray-100 dark:bg-gray-800",
                      "border border-gray-200 dark:border-gray-700",
                      "text-gray-900 dark:text-white",
                      "placeholder:text-gray-500 dark:placeholder:text-gray-400",
                      "focus:outline-none focus:ring-2 focus:ring-terracotta/50",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "resize-none"
                    )}
                    rows={1}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim() || hasReachedLimit}
                    className={cn(
                      "p-2 rounded-2xl transition-all duration-200",
                      "flex items-center justify-center",
                      !isLoading && !hasReachedLimit && input.trim()
                        ? cn(
                            "bg-terracotta text-white hover:bg-terracotta/90",
                            "dark:bg-terracotta/80 dark:hover:bg-terracotta/70"
                          )
                        : "bg-gray-200 text-gray-400 dark:bg-gray-800 dark:text-gray-600",
                      "disabled:cursor-not-allowed"
                    )}
                    aria-label="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default AskThisPost;
