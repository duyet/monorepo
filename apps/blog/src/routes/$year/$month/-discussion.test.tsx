import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Discussion } from "./-discussion";

const thread = {
  id: 1,
  children: [
    {
      id: 2,
      author: "alice",
      text: '<p>top <i>level</i></p><p><a href="javascript:alert(1)">bad</a><script>x</script></p>',
      created_at_i: 1700000000,
      children: [
        { id: 3, author: "bob", text: "nested reply", created_at_i: 1700000100, children: [] },
      ],
    },
  ],
};

afterEach(() => vi.unstubAllGlobals());

describe("Discussion", () => {
  it("fetches nothing until expanded, then renders nested comments", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(thread)));
    vi.stubGlobal("fetch", fetchMock);
    render(<Discussion hackerNews="https://news.ycombinator.com/item?id=1" />);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.queryByText("alice")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /discussion/i }));
    await waitFor(() => expect(screen.getByText("bob")).toBeTruthy());
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(screen.getByText("nested reply")).toBeTruthy();
  });

  it("never injects script tags or javascript: links", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(thread))));
    const { container } = render(<Discussion hackerNews="https://news.ycombinator.com/item?id=1" />);
    fireEvent.click(screen.getByRole("button", { name: /discussion/i }));
    await waitFor(() => expect(screen.getByText("alice")).toBeTruthy());
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector('a[href^="javascript"]')).toBeNull();
  });

  it("collapses a comment and its replies", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(thread))));
    render(<Discussion hackerNews="https://news.ycombinator.com/item?id=1" />);
    fireEvent.click(screen.getByRole("button", { name: /discussion/i }));
    await waitFor(() => expect(screen.getByText("bob")).toBeTruthy());
    fireEvent.click(screen.getAllByRole("button", { name: /collapse comment/i })[0]);
    expect(screen.queryByText("bob")).toBeNull();
    expect(screen.getByText("(1 child)")).toBeTruthy();
  });
});
