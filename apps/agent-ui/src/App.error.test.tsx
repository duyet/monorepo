import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useAuth = vi.fn();
const regenerate = vi.fn();
const sendMessage = vi.fn();
const stop = vi.fn();
const setMessages = vi.fn();
const useChat = vi.fn();

vi.mock("@clerk/clerk-react", () => ({
  useAuth: () => useAuth(),
  SignedIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SignedOut: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SignInButton: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  UserButton: () => <button type="button">Account</button>,
}));

vi.mock("@ai-sdk/react", () => ({
  useChat: () => useChat(),
}));

const { App } = await import("./App");

describe("ChatScreen error UI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ getToken: async () => "tok", isSignedIn: true });
    useChat.mockReturnValue({
      error: null,
      messages: [],
      regenerate,
      sendMessage,
      setMessages,
      status: "ready",
      stop,
    });
  });

  it("shows a human-readable message and a working Retry instead of the raw error", () => {
    useChat.mockReturnValue({
      error: { message: "Failed to fetch" },
      messages: [],
      regenerate,
      sendMessage,
      setMessages,
      status: "error",
      stop,
    });

    render(<App />);

    // The raw transport error must not leak into the UI.
    expect(screen.queryByText(/failed to fetch/i)).toBeNull();
    // The mapped copy is actionable and offers a retry.
    expect(
      screen.getByText(/could not reach the chat service/i),
    ).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: /retry/i }));
    expect(regenerate).toHaveBeenCalledTimes(1);
  });

  it("offers a sign-in path instead of an unusable prompt when unsigned", () => {
    useAuth.mockReturnValue({ getToken: async () => null, isSignedIn: false });

    render(<App />);

    expect(screen.getByRole("button", { name: /sign in to continue/i })).toBeDefined();
    // No message input is offered to a signed-out visitor.
    expect(screen.queryByPlaceholderText(/ask duyet anything/i)).toBeNull();
  });

  it("keeps the conversation surface visible and submits when signed in", () => {
    render(<App />);

    // The empty chat surface renders regardless of auth.
    expect(screen.getByText("Ask Duyet anything.")).toBeDefined();

    const textarea = screen.getByPlaceholderText(/ask duyet anything/i);
    fireEvent.change(textarea, { target: { value: "  What is Duyet working on?  " } });
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    // Trimmed text is sent exactly once.
    expect(sendMessage).toHaveBeenCalledTimes(1);
    expect(sendMessage).toHaveBeenCalledWith({
      text: "What is Duyet working on?",
    });
  });
});
