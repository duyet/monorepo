import { describe, expect, test } from "vitest";
import type { UIMessage } from "ai";
import {
  getLatestAssistantText,
  getPendingInteractions,
  getTextFromParts,
  hasReasoningParts,
  inlineDataUrls,
  stripReasoningParts,
} from "./message-parts";

function message(role: UIMessage["role"], parts: unknown[]): UIMessage {
  return { id: `${role}-1`, parts, role } as UIMessage;
}

describe("getTextFromParts", () => {
  test("joins text parts and drops everything else", () => {
    expect(
      getTextFromParts([
        { text: "Hello ", type: "text" },
        { text: "hidden", type: "reasoning" },
        { text: "world", type: "text" },
      ] as UIMessage["parts"])
    ).toBe("Hello world");
  });
});

describe("getLatestAssistantText", () => {
  test("reads the newest assistant turn", () => {
    const messages = [
      message("assistant", [{ text: "first", type: "text" }]),
      message("user", [{ text: "question", type: "text" }]),
      message("assistant", [{ text: "second", type: "text" }]),
    ];

    expect(getLatestAssistantText(messages)).toBe("second");
  });

  test("returns an empty string when no assistant turn exists", () => {
    expect(
      getLatestAssistantText([message("user", [{ text: "hi", type: "text" }])])
    ).toBe("");
  });
});

describe("reasoning part handling", () => {
  test("detects and strips reasoning parts", () => {
    const messages = [
      message("assistant", [
        { text: "chain of thought", type: "reasoning" },
        { text: "answer", type: "text" },
      ]),
    ];

    expect(hasReasoningParts(messages)).toBe(true);
    expect(stripReasoningParts(messages)[0]?.parts).toEqual([
      { text: "answer", type: "text" },
    ]);
  });

  test("reports no reasoning when none are present", () => {
    expect(
      hasReasoningParts([message("assistant", [{ text: "hi", type: "text" }])])
    ).toBe(false);
  });
});

describe("getPendingInteractions", () => {
  test("returns nothing without an assistant turn", () => {
    expect(
      getPendingInteractions([message("user", [{ type: "text" }])])
    ).toEqual([]);
  });

  test("collects tool calls awaiting a result", () => {
    const interactions = getPendingInteractions([
      message("assistant", [
        { state: "output-available", type: "tool-done", output: "ok" },
        {
          input: { taskId: "t1" },
          state: "approval-requested",
          toolCallId: "call-1",
          type: "tool-cancelScheduledTask",
        },
      ]),
    ]);

    expect(interactions).toEqual([
      {
        input: { taskId: "t1" },
        state: "approval-requested",
        toolCallId: "call-1",
        toolName: "cancelScheduledTask",
        type: "tool-cancelScheduledTask",
      },
    ]);
  });

  test("ignores tool calls that already produced output", () => {
    expect(
      getPendingInteractions([
        message("assistant", [
          { output: "done", state: "output-available", type: "tool-x" },
          { output: "boom", state: "output-error", type: "tool-y" },
        ]),
      ])
    ).toEqual([]);
  });

  test("ignores non-tool parts", () => {
    expect(
      getPendingInteractions([
        message("assistant", [
          { text: "thinking", type: "text" },
          { type: "step-start" },
        ]),
      ])
    ).toEqual([]);
  });

  test("derives the tool name from a tool- prefixed type", () => {
    const interactions = getPendingInteractions([
      message("assistant", [{ state: "", type: "tool-getUserTimezone" }]),
    ]);

    expect(interactions[0]?.toolName).toBe("getUserTimezone");
    expect(interactions[0]?.toolCallId).toBeUndefined();
  });
});

describe("inlineDataUrls", () => {
  const base64 = btoa("hello");

  function firstContent(
    messages: Parameters<typeof inlineDataUrls>[0]
  ): Array<{ data: unknown; mediaType?: string }> {
    const content = messages[0]?.content;
    if (typeof content === "string") {
      throw new Error("expected a structured message content");
    }
    return content as Array<{ data: unknown; mediaType?: string }>;
  }

  test("decodes base64 file parts into bytes with the media type", () => {
    const result = inlineDataUrls([
      {
        content: [
          {
            data: `data:text/plain;base64,${base64}`,
            type: "file",
          },
        ],
        role: "user",
      },
    ] as unknown as Parameters<typeof inlineDataUrls>[0]);

    const part = firstContent(result)[0];
    expect(part?.mediaType).toBe("text/plain");
    expect(new TextDecoder().decode(part?.data as Uint8Array)).toBe("hello");
  });

  test("leaves non-data-URL file parts untouched", () => {
    const result = inlineDataUrls([
      {
        content: [{ data: "not-a-data-url", type: "file" }],
        role: "user",
      },
    ] as unknown as Parameters<typeof inlineDataUrls>[0]);

    expect(firstContent(result)[0]?.data).toBe("not-a-data-url");
  });

  test("leaves assistant and string-content messages untouched", () => {
    const assistant = inlineDataUrls([
      {
        content: [{ data: `data:text/plain;base64,${base64}`, type: "file" }],
        role: "assistant",
      },
    ] as unknown as Parameters<typeof inlineDataUrls>[0]);
    const stringContent = inlineDataUrls([
      { content: "plain", role: "user" },
    ] as unknown as Parameters<typeof inlineDataUrls>[0]);

    expect(assistant[0]).toEqual({
      content: [{ data: `data:text/plain;base64,${base64}`, type: "file" }],
      role: "assistant",
    });
    expect(stringContent[0]?.content).toBe("plain");
  });
});
