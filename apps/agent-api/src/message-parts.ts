/**
 * UIMessage part readers shared by the Durable Object and the public message
 * projection. Kept free of Agent state so they stay unit-testable.
 * @module message-parts
 */

import type { ModelMessage, UIMessage } from "ai";

export interface PendingInteraction {
  input?: unknown;
  state?: string;
  toolCallId?: string;
  toolName?: string;
  type: string;
}

const DATA_URL = /^data:([^;]+);base64,(.+)$/;

export function inlineDataUrls(messages: ModelMessage[]): ModelMessage[] {
  return messages.map((message) => {
    if (message.role !== "user" || typeof message.content === "string") {
      return message;
    }

    return {
      ...message,
      content: message.content.map((part) => {
        if (part.type !== "file" || typeof part.data !== "string") {
          return part;
        }

        const match = part.data.match(DATA_URL);
        if (!match) return part;

        try {
          const bytes = Uint8Array.from(atob(match[2] ?? ""), (char) =>
            char.charCodeAt(0)
          );
          return { ...part, data: bytes, mediaType: match[1] };
        } catch {
          return part;
        }
      }),
    };
  });
}

export function getTextFromParts(parts: UIMessage["parts"]): string {
  return parts
    .map((part) => {
      if (part.type === "text") return part.text;
      return "";
    })
    .join("")
    .trim();
}

function latestAssistant(messages: UIMessage[]): UIMessage | undefined {
  return [...messages].reverse().find((message) => {
    return message.role === "assistant";
  });
}

export function getLatestAssistantText(messages: UIMessage[]): string {
  const latest = latestAssistant(messages);

  return latest ? getTextFromParts(latest.parts) : "";
}

export function hasReasoningParts(messages: UIMessage[]): boolean {
  return messages.some((message) => {
    return message.parts.some((part) => part.type === "reasoning");
  });
}

export function stripReasoningParts(messages: UIMessage[]): UIMessage[] {
  return messages.map((message) => ({
    ...message,
    parts: message.parts.filter((part) => part.type !== "reasoning"),
  }));
}

/**
 * Tool calls on the newest assistant turn that still need a result: no output
 * yet and a state that expects a response (approval, input, or a bare call).
 */
export function getPendingInteractions(
  messages: UIMessage[]
): PendingInteraction[] {
  const latest = latestAssistant(messages);
  if (!latest) return [];

  return latest.parts.flatMap((part) => {
    const record = part as Record<string, unknown>;
    const type = String(record.type ?? "");
    if (type !== "tool" && !type.startsWith("tool-")) return [];

    const state = String(record.state ?? "");
    const hasOutput =
      "output" in record ||
      state === "output-available" ||
      state === "output-error";
    if (hasOutput) return [];

    if (
      state.includes("approval") ||
      state.includes("input") ||
      state === "" ||
      state === "partial-call"
    ) {
      return [
        {
          input: record.input,
          state,
          toolCallId:
            typeof record.toolCallId === "string"
              ? record.toolCallId
              : undefined,
          toolName:
            typeof record.toolName === "string"
              ? record.toolName
              : type.replace(/^tool-/, ""),
          type,
        },
      ];
    }

    return [];
  });
}
