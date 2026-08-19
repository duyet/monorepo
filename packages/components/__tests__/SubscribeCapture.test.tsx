import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  SUBSCRIBE_STORAGE_KEY,
  SubscribeCapture,
  writeSubscribed,
} from "../subscribe/SubscribeCapture";

describe("SubscribeCapture", () => {
  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("renders a small Subscribe button by default", () => {
    render(<SubscribeCapture />);
    expect(screen.getByRole("button", { name: "Subscribe" })).toBeTruthy();
  });

  it("opens a compact dialog from the button", () => {
    render(<SubscribeCapture />);
    fireEvent.click(screen.getByRole("button", { name: "Subscribe" }));
    expect(screen.getByText("Get updates")).toBeTruthy();
    expect(screen.getByPlaceholderText("you@example.com")).toBeTruthy();
  });

  it("hides the button after a stored subscription", () => {
    writeSubscribed();
    const { container } = render(<SubscribeCapture />);
    expect(container.querySelector("button")).toBeNull();
    expect(localStorage.getItem(SUBSCRIBE_STORAGE_KEY)).toBe("1");
  });

  it("posts email to the subscribe endpoint from the inline form", async () => {
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify({ ok: true }), { status: 200 })
    );
    vi.stubGlobal("fetch", fetchMock);
    render(<SubscribeCapture variant="inline" source="blog" />);
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "reader@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Subscribe" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toMatchObject({
      email: "reader@example.com",
      source: "blog",
    });
    await waitFor(() =>
      expect(screen.getByText("You're subscribed for updates.")).toBeTruthy()
    );
  });
});
