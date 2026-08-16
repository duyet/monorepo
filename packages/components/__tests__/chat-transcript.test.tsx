import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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

  it("scrolls the viewport to the end when MessageScrollerButton is clicked", () => {
    const scrollTo = vi.fn();
    const { getByRole } = render(
      <ChatTranscript
        messages={[{ id: "1", role: "user", text: "hello from user" }]}
      />,
    );
    const viewport = document.querySelector(
      '[data-slot="message-scroller-viewport"]',
    );
    expect(viewport).not.toBe(null);
    Object.defineProperty(viewport, "scrollHeight", {
      configurable: true,
      value: 800,
    });
    (viewport as HTMLDivElement).scrollTo = scrollTo;

    getByRole("button", { name: "Scroll to end" }).click();
    expect(scrollTo).toHaveBeenCalledWith({ top: 800, behavior: "smooth" });
  });
});
