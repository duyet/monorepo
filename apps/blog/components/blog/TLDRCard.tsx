"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw } from "lucide-react";
import { cn } from "@duyet/libs/utils";

interface TLDRCardProps {
  content: string;
  slug: string;
}

type CardState = "idle" | "generating" | "complete";

interface CachedSummary {
  summary: string[];
  model: string;
  timestamp: number;
}

const CACHE_KEY_PREFIX = "tldr_";
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

function getCachedSummary(slug: string): { summary: string[]; model: string } | null {
  if (typeof window === "undefined") return null;

  const cached = localStorage.getItem(CACHE_KEY_PREFIX + slug);
  if (!cached) return null;

  try {
    const parsed: CachedSummary = JSON.parse(cached);
    const now = Date.now();

    if (now - parsed.timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY_PREFIX + slug);
      return null;
    }

    return { summary: parsed.summary, model: parsed.model };
  } catch {
    return null;
  }
}

function setCachedSummary(slug: string, summary: string[], model: string): void {
  if (typeof window === "undefined") return;

  const cached: CachedSummary = {
    summary,
    model,
    timestamp: Date.now(),
  };

  localStorage.setItem(CACHE_KEY_PREFIX + slug, JSON.stringify(cached));
}

export function TLDRCard({ content, slug }: TLDRCardProps) {
  const [state, setState] = useState<CardState>("idle");
  const [summary, setSummary] = useState<string[]>([]);
  const [displayedText, setDisplayedText] = useState("");
  const [modelName, setModelName] = useState<string>("");
  const streamingRef = useRef<string>("");

  // Check for cached summary on mount
  useEffect(() => {
    const cached = getCachedSummary(slug);
    if (cached) {
      setSummary(cached.summary);
      setModelName(cached.model);
      setState("complete");
    }
  }, [slug]);

  const generateSummary = async () => {
    setState("generating");
    streamingRef.current = "";
    setDisplayedText("");
    setSummary([]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "tldr",
          context: content,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate summary");

      // Get model name from header
      const model = response.headers.get("X-Model") || "AI";
      setModelName(model);

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;
        streamingRef.current += chunk;
        setDisplayedText(streamingRef.current);
      }

      // Parse the response into bullet points
      const bullets = fullResponse
        .split("\n")
        .filter((line) => line.trim().length > 0)
        .map((line) => line.replace(/^[-•*]\s*/, "").trim())
        .filter((line) => line.length > 0);

      setSummary(bullets);
      setDisplayedText("");
      setState("complete");
      setCachedSummary(slug, bullets, model);
    } catch (error) {
      console.error("Error generating summary:", error);
      setState("idle");
      setDisplayedText("");
    }
  };

  const refresh = async () => {
    localStorage.removeItem(CACHE_KEY_PREFIX + slug);
    await generateSummary();
  };

  return (
    <div className="my-8">
      <AnimatePresence mode="wait">
        {state === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {/* Empty state - button at bottom */}
            <div className="text-center py-4">
              <button
                onClick={generateSummary}
                className={cn(
                  "inline-flex items-center gap-1.5 px-2 py-1 rounded-md",
                  "text-xs text-gray-500 dark:text-gray-400",
                  "hover:bg-gray-100 dark:hover:bg-gray-800",
                  "transition-colors duration-150"
                )}
                title="Generate AI summary"
              >
                <Sparkles size={12} className="text-orange-400" />
                <span>TL;DR</span>
              </button>
            </div>
          </motion.div>
        )}

        {state === "generating" && (
          <motion.div
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="space-y-3"
          >
            {/* Header with tiny status */}
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-orange-400"
              />
              <span>Generating summary...</span>
            </div>

            {/* Streaming text area */}
            <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed min-h-24 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 font-mono">
              {displayedText}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="inline-block ml-0.5 w-0.5 h-3 bg-gray-400 align-middle"
              />
            </div>
          </motion.div>
        )}

        {state === "complete" && summary.length > 0 && (
          <motion.div
            key="complete"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="space-y-4"
          >
            {/* Clean header */}
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                TL;DR
              </h4>

              <div className="flex items-center gap-2">
                {/* Model name */}
                {modelName && (
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                    {modelName.split("/").pop()?.replace(":free", "") || modelName}
                  </span>
                )}

                {/* Refresh button */}
                <button
                  onClick={refresh}
                  className={cn(
                    "p-1 rounded",
                    "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300",
                    "hover:bg-gray-100 dark:hover:bg-gray-800",
                    "transition-colors duration-150"
                  )}
                  title="Regenerate summary"
                >
                  <RefreshCw size={12} />
                </button>
              </div>
            </div>

            {/* Simple bullet list */}
            <ul className="space-y-2">
              {summary.map((bullet, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.2 }}
                  className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed pl-3.5 relative"
                >
                  <span className="absolute left-0 top-1.5 w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                  {bullet}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default TLDRCard;
