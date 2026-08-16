import { render } from "@testing-library/react";
import type { UIMessage } from "ai";
import { describe, expect, it } from "vitest";
import { ChatMessage } from "./chat-message";
import { ChatConversation } from "./chat";

function textMessage(
  id: string,
  role: "user" | "assistant",
  text: string,
): UIMessage {
  return {
    id,
    role,
    parts: [{ type: "text", text }],
  };
}

describe("chatbot-template chat message", () => {
  it("renders user text through the official Bubble", () => {
    const { getByText, container } = render(
      <ChatMessage message={textMessage("1", "user", "hello from user")} />,
    );
    expect(getByText("hello from user")).toBeDefined();
    expect(container.querySelector('[data-slot="bubble"]')).not.toBe(null);
  });

  it("renders the template empty state", () => {
    const { getByText } = render(
      <ChatConversation
        messages={[]}
        isBusy={false}
        canSubmit={true}
        onSelectSuggestion={() => {}}
      />,
    );
    expect(getByText("Ask Duyet anything.")).toBeDefined();
    expect(getByText("What is Duyet working on?")).toBeDefined();
  });
});
