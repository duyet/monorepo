import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChatTranscript } from "../chat/ChatTranscript";
import {
  Attachment,
  Bubble,
  Marker,
  Message,
  MessageScroller,
} from "../chat";

describe("shadcn chat primitives", () => {
  it("exports official June 2026 chat components as functions", () => {
    expect(typeof MessageScroller).toBe("function");
    expect(typeof Message).toBe("function");
    expect(typeof Bubble).toBe("function");
    expect(typeof Attachment).toBe("function");
    expect(typeof Marker).toBe("function");
  });

  it("renders ChatTranscript through MessageScroller + Message + Bubble + Attachment + Marker", () => {
    const { getByText, container } = render(
      <ChatTranscript
        markerLabel="Today"
        messages={[
          { id: "1", role: "user", text: "hello from user" },
          {
            id: "2",
            role: "assistant",
            text: "hello from agent",
            attachmentLabel: "notes.md",
          },
        ]}
      />,
    );

    expect(getByText("Today")).toBeDefined();
    expect(getByText("hello from user")).toBeDefined();
    expect(getByText("hello from agent")).toBeDefined();
    expect(getByText("notes.md")).toBeDefined();
    expect(container.querySelector('[data-slot="message-scroller"]')).not.toBe(
      null,
    );
    expect(container.querySelector('[data-slot="message"]')).not.toBe(null);
    expect(container.querySelector('[data-slot="bubble"]')).not.toBe(null);
    expect(container.querySelector('[data-slot="attachment"]')).not.toBe(null);
    expect(container.querySelector('[data-slot="marker"]')).not.toBe(null);
  });
});
