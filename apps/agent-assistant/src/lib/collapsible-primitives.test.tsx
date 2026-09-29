// @vitest-environment happy-dom
import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const lockScroll = vi.fn();
vi.mock("@assistant-ui/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@assistant-ui/react")>();
  return { ...actual, useScrollLock: () => lockScroll };
});

import {
  ReasoningContent,
  ReasoningRoot,
  ReasoningTrigger,
} from "@/components/assistant-ui/reasoning";

describe("useCollapseState behavior (refactored)", () => {
  it("uncontrolled: toggles open/closed and locks scroll on close", () => {
    const { container } = render(
      <ReasoningRoot>
        <ReasoningTrigger>T</ReasoningTrigger>
        <ReasoningContent>body</ReasoningContent>
      </ReasoningRoot>
    );

    const trigger = container.querySelector(
      '[data-slot="reasoning-trigger"]'
    ) as Element;
    const root = container.querySelector('[data-slot="reasoning-root"]');

    expect(root?.getAttribute("data-state")).toBe("closed");

    fireEvent.click(trigger);
    expect(root?.getAttribute("data-state")).toBe("open");
    // Opening must not lock scroll.
    expect(lockScroll).not.toHaveBeenCalled();

    fireEvent.click(trigger);
    expect(root?.getAttribute("data-state")).toBe("closed");
    // Closing locks scroll exactly once.
    expect(lockScroll).toHaveBeenCalledTimes(1);
  });

  it("controlled: calls onOpenChange but does not self-mutate", () => {
    const onOpenChange = vi.fn();
    const { container, unmount } = render(
      <ReasoningRoot open={false} onOpenChange={onOpenChange}>
        <ReasoningTrigger>T</ReasoningTrigger>
        <ReasoningContent>body</ReasoningContent>
      </ReasoningRoot>
    );

    const root = container.querySelector('[data-slot="reasoning-root"]');
    fireEvent.click(
      container.querySelector('[data-slot="reasoning-trigger"]') as Element
    );

    expect(onOpenChange).toHaveBeenCalledWith(true);
    // Still closed: the parent owns the state.
    expect(root?.getAttribute("data-state")).toBe("closed");
    unmount();
  });

  it("defaultOpen seeds the initial state", () => {
    const { container } = render(
      <ReasoningRoot defaultOpen>
        <ReasoningTrigger>T</ReasoningTrigger>
        <ReasoningContent>body</ReasoningContent>
      </ReasoningRoot>
    );
    expect(
      container
        .querySelector('[data-slot="reasoning-root"]')
        ?.getAttribute("data-state")
    ).toBe("open");
  });
});
