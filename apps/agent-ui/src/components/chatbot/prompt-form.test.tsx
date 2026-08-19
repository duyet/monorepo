import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PromptForm } from "./prompt-form";

describe("PromptForm", () => {
  it("calls onSubmit with the typed text", () => {
    const onSubmit = vi.fn();
    const { getByPlaceholderText } = render(
      <PromptForm
        isBusy={false}
        placeholder="Ask Duyet anything…"
        onSubmit={onSubmit}
        onStop={() => {}}
      />,
    );

    const textarea = getByPlaceholderText("Ask Duyet anything…");
    fireEvent.change(textarea, {
      target: { value: "Summarize the LLM Timeline" },
    });
    fireEvent.submit(textarea.closest("form") as HTMLFormElement);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith("Summarize the LLM Timeline");
  });

  it("calls onStop while busy instead of sending", () => {
    const onSubmit = vi.fn();
    const onStop = vi.fn();
    const { getByLabelText, queryByLabelText } = render(
      <PromptForm
        isBusy
        placeholder="Ask Duyet anything…"
        onSubmit={onSubmit}
        onStop={onStop}
      />,
    );

    fireEvent.click(getByLabelText("Stop generating"));
    expect(onStop).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(queryByLabelText("Send message")).toBeNull();
  });
});
