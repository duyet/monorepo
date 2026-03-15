"use client";

import { cn } from "@duyet/libs";
import { Clock, Coins, Wrench, Zap } from "lucide-react";
import type { Message } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface MessageMetadataProps {
  message: Message;
  isStreaming?: boolean;
}

export function MessageMetadata({
  message,
  isStreaming,
}: MessageMetadataProps) {
  // Only show metadata for completed assistant messages
  if (message.role !== "assistant" || isStreaming) return null;

  const hasMetadata =
    message.model || message.duration || message.tokens || message.toolCalls;

  if (!hasMetadata) return null;

  // Format duration
  const formatDuration = (ms?: number) => {
    if (!ms) return null;
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  // Format token count
  const formatTokens = (tokens?: number) => {
    if (!tokens) return null;
    if (tokens < 1000) return `${tokens}`;
    return `${(tokens / 1000).toFixed(1)}k`;
  };

  // Get model display name
  const getModelName = (model?: string) => {
    if (!model) return null;
    if (model.includes("llama-4-scout")) return "Llama 4 Scout";
    if (model.includes("llama-3")) return "Llama 3";
    return (
      model
        .split("/")
        .pop()
        ?.replace(/^@cf\//, "") || model
    );
  };

  const modelName = getModelName(message.model);
  const duration = formatDuration(message.duration);

  return (
    <div
      className={cn(
        "flex items-center gap-1.5",
        "opacity-70 hover:opacity-100 transition-opacity"
      )}
    >
      {modelName && (
        <Badge
          variant="secondary"
          className="gap-1 font-normal text-[11px] font-[family-name:var(--font-geist-mono)]"
          title="Model used"
        >
          <Zap className="h-3 w-3" />
          {modelName}
        </Badge>
      )}

      {message.tokens && (
        <Badge
          variant="secondary"
          className="gap-1 font-normal text-[11px] font-[family-name:var(--font-geist-mono)]"
          title="Tokens used"
        >
          <Coins className="h-3 w-3" />
          {formatTokens(message.tokens.total)}
          {message.tokens.prompt && message.tokens.completion && (
            <span className="opacity-70">
              ({formatTokens(message.tokens.prompt)}+
              {formatTokens(message.tokens.completion)})
            </span>
          )}
        </Badge>
      )}

      {duration && (
        <Badge
          variant="secondary"
          className="gap-1 font-normal text-[11px] font-[family-name:var(--font-geist-mono)]"
          title="Generation time"
        >
          <Clock className="h-3 w-3" />
          {duration}
        </Badge>
      )}

      {message.toolCalls !== undefined && message.toolCalls > 0 && (
        <Badge
          variant="secondary"
          className="gap-1 font-normal text-[11px] font-[family-name:var(--font-geist-mono)]"
          title="Tool calls made"
        >
          <Wrench className="h-3 w-3" />
          {message.toolCalls}
        </Badge>
      )}
    </div>
  );
}
