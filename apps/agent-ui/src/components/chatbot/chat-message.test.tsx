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

  it("renders assistant markdown outside the user bubble", () => {
    const { getByText, container } = render(
      <ChatMessage
        message={textMessage("2", "assistant", "Hello **Duyet**")}
      />,
    );
    expect(getByText("Duyet").tagName).toBe("STRONG");
    expect(container.querySelector('[data-slot="bubble"]')).toBe(null);
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

  it("renders a user bubble and assistant markdown in the scroller", () => {
    const { getByText, container } = render(
      <ChatConversation
        messages={[
          textMessage("u1", "user", "ping from the scroller"),
          textMessage("a1", "assistant", "Building **agents**."),
        ]}
        isBusy={false}
        canSubmit={true}
        onSelectSuggestion={() => {}}
      />,
    );
    expect(getByText("ping from the scroller")).toBeDefined();
    expect(getByText("agents").tagName).toBe("STRONG");
    expect(container.querySelector('[data-slot="message-scroller"]')).not.toBe(
      null,
    );
    expect(container.querySelector('[data-slot="bubble"]')).not.toBe(null);
  });
});
