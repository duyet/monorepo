import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useAuth,
} from "@clerk/clerk-react";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { RotateCcw, Send, Sparkles } from "lucide-react";
import { type FormEvent, useCallback, useMemo, useState } from "react";
import {
  AgentApiTransport,
  type AgentChatResponse,
} from "./agent-api-transport";

const SESSION_STORAGE_KEY = "duyet-agent-ui-session-id";

function createSessionId(): string {
  return `web-${crypto.randomUUID()}`;
}

function readSessionId(): string {
  const stored = localStorage.getItem(SESSION_STORAGE_KEY);
  if (stored) return stored;

  const sessionId = createSessionId();
  localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  return sessionId;
}

function agentApiUrl(): string {
  const configured =
    import.meta.env.VITE_DUYET_AGENTS_API_URL ??
    import.meta.env.VITE_AGENT_API_URL;

  if (configured) return configured;

  if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    return "http://localhost:8788";
  }

  return location.origin;
}

function textParts(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

function MessageBubble({ message }: { message: UIMessage }) {
  const text = textParts(message);

  return (
    <div className={`message-row ${message.role}`}>
      <article className="message-bubble">
        <div className="message-role">
          {message.role === "user" ? "You" : "Agent"}
        </div>
        <p>{text}</p>
      </article>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="empty-state">
      <Sparkles aria-hidden="true" size={22} />
      <h2>Duyet Agents</h2>
      <p>Ask about Duyet Le, duyet.net, projects, posts, and data work.</p>
    </div>
  );
}

function ResponseStatus({ response }: { response: AgentChatResponse | null }) {
  if (!response) return null;

  const pendingCount = response.pendingInteractions?.length ?? 0;

  return (
    <div className="response-status">
      <span>{response.authMode ?? "clerk"}</span>
      <span>{response.status ?? "ready"}</span>
      {pendingCount > 0 ? <span>{pendingCount} pending</span> : null}
    </div>
  );
}

function ChatScreen() {
  const { getToken } = useAuth();
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(readSessionId);
  const [lastResponse, setLastResponse] = useState<AgentChatResponse | null>(
    null
  );

  const transport = useMemo(
    () =>
      new AgentApiTransport({
        apiUrl: agentApiUrl(),
        getSessionId: () => sessionId,
        getTimezone: () => Intl.DateTimeFormat().resolvedOptions().timeZone,
        getToken,
        onResponse: setLastResponse,
      }),
    [getToken, sessionId]
  );

  const { error, messages, sendMessage, setMessages, status } =
    useChat<UIMessage>({
      id: sessionId,
      transport,
    });

  const isBusy = status === "submitted" || status === "streaming";

  const resetSession = useCallback(() => {
    const nextSessionId = createSessionId();
    localStorage.setItem(SESSION_STORAGE_KEY, nextSessionId);
    setSessionId(nextSessionId);
    setLastResponse(null);
    setMessages([]);
  }, [setMessages]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = input.trim();
    if (!text || isBusy) return;

    setInput("");
    void sendMessage({ text });
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <Sparkles aria-hidden="true" size={18} />
          <span>Duyet Agents</span>
        </div>
        <div className="topbar-actions">
          <ResponseStatus response={lastResponse} />
          <button
            aria-label="Reset conversation"
            className="icon-button"
            onClick={resetSession}
            type="button"
          >
            <RotateCcw aria-hidden="true" size={16} />
          </button>
          <UserButton />
        </div>
      </header>

      <section className="chat-panel" aria-label="Agent conversation">
        <div className="message-list">
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}
          {error ? <div className="error-banner">{error.message}</div> : null}
        </div>

        <form className="composer" onSubmit={handleSubmit}>
          <textarea
            aria-label="Message"
            onChange={(event) => setInput(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            placeholder="Ask Duyet Agents"
            rows={1}
            value={input}
          />
          <button
            aria-label="Send message"
            className="send-button"
            disabled={!input.trim() || isBusy}
            type="submit"
          >
            <Send aria-hidden="true" size={18} />
          </button>
        </form>
      </section>
    </main>
  );
}

function SignInScreen() {
  return (
    <main className="auth-shell">
      <div className="auth-panel">
        <Sparkles aria-hidden="true" size={24} />
        <h1>Duyet Agents</h1>
        <SignInButton mode="modal">
          <button className="primary-button" type="button">
            Sign in
          </button>
        </SignInButton>
      </div>
    </main>
  );
}

export function App() {
  return (
    <>
      <SignedOut>
        <SignInScreen />
      </SignedOut>
      <SignedIn>
        <ChatScreen />
      </SignedIn>
    </>
  );
}
