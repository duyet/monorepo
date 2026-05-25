import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useAuth,
} from "@clerk/clerk-react";
import { useChat } from "@ai-sdk/react";
import { SiteNavV2 } from "@duyet/components";
import type { UIMessage } from "ai";
import { ArrowUp, RotateCcw } from "lucide-react";
import {
  type FormEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AgentApiTransport,
  type AgentChatResponse,
} from "./agent-api-transport";

const SESSION_STORAGE_KEY = "duyet-agent-ui-session-id";

const GLOBAL_NAV_LINKS = [
  { name: "Home", href: "https://duyet.net" },
  { name: "Projects", href: "https://duyet.net/projects" },
  { name: "About", href: "https://duyet.net/about" },
  { name: "Blog", href: "https://blog.duyet.net" },
  { name: "CV", href: "https://cv.duyet.net" },
  { name: "Insights", href: "https://insights.duyet.net" },
  { name: "Agent", href: "/", active: true },
];

const SUGGESTIONS = [
  "What is Duyet working on right now?",
  "Show me the most recent blog posts",
  "Summarize the LLM Timeline project",
  "Which projects use ClickHouse?",
];

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

function Message({ message }: { message: UIMessage }) {
  const text = textParts(message);
  const isUser = message.role === "user";
  return (
    <div className="flex flex-col gap-1.5">
      <span className="eyebrow-mono">{isUser ? "You" : "Agent"}</span>
      <p className="whitespace-pre-wrap break-words text-[15px] leading-7 text-[color:var(--foreground)]">
        {text}
      </p>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="eyebrow-mono">Agent</span>
      <div className="flex items-center gap-1.5 py-1" aria-label="Thinking">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[color:var(--muted)] [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[color:var(--muted)] [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[color:var(--muted)]" />
      </div>
    </div>
  );
}

function Hero({
  onPick,
  disabled,
}: {
  onPick: (prompt: string) => void;
  disabled: boolean;
}) {
  return (
    <section className="flex flex-col gap-8 py-12 sm:py-20">
      <div className="flex flex-col gap-3">
        <span className="eyebrow-mono">AI assistant · 2026</span>
        <h1 className="display-tight text-4xl sm:text-5xl text-[color:var(--foreground)]">
          Ask Duyet anything.
        </h1>
        <p className="max-w-xl text-[15px] leading-7 text-[color:var(--muted)]">
          An agent that knows my blog, projects, public data, and the work I'm
          shipping right now. Conversational, streaming, grounded in real
          sources.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onPick(prompt)}
            disabled={disabled}
            className="pill-outline disabled:cursor-not-allowed disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>
    </section>
  );
}

function ChatScreen() {
  const { getToken, isSignedIn } = useAuth();
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(readSessionId);
  const [, setLastResponse] = useState<AgentChatResponse | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const transport = useMemo(
    () =>
      new AgentApiTransport({
        apiUrl: agentApiUrl(),
        getSessionId: () => sessionId,
        getTimezone: () => Intl.DateTimeFormat().resolvedOptions().timeZone,
        getToken,
        onResponse: setLastResponse,
      }),
    [getToken, sessionId],
  );

  const { error, messages, sendMessage, setMessages, status } =
    useChat<UIMessage>({
      id: sessionId,
      transport,
    });

  const isBusy = status === "submitted" || status === "streaming";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, status]);

  const resetSession = useCallback(() => {
    const nextSessionId = createSessionId();
    localStorage.setItem(SESSION_STORAGE_KEY, nextSessionId);
    setSessionId(nextSessionId);
    setLastResponse(null);
    setMessages([]);
  }, [setMessages]);

  const submit = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isBusy || !isSignedIn) return;
      setInput("");
      void sendMessage({ text: trimmed });
    },
    [isBusy, isSignedIn, sendMessage],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit(input);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit(input);
    }
  };

  const empty = messages.length === 0;

  return (
    <main className="min-h-dvh bg-[color:var(--background)] text-[color:var(--foreground)]">
      <SiteNavV2
        brandText="Duyet Le"
        brandHref="https://duyet.net"
        activeApp="agent"
        links={GLOBAL_NAV_LINKS}
      />

      <div className="mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-[760px] flex-col px-5 sm:px-8">
        {empty ? (
          <Hero onPick={submit} disabled={!isSignedIn || isBusy} />
        ) : (
          <div className="flex-1 py-8">
            <div className="flex items-center justify-between pb-6">
              <span className="eyebrow-mono">Conversation</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetSession}
                  className="pill-outline text-xs"
                  aria-label="New conversation"
                >
                  <RotateCcw size={12} aria-hidden="true" />
                  New
                </button>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </div>
            </div>
            <div className="flex flex-col gap-8">
              {messages.map((message) => (
                <Message key={message.id} message={message} />
              ))}
              {isBusy ? <TypingDots /> : null}
              {error ? (
                <p className="text-sm text-red-500">{error.message}</p>
              ) : null}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        <div className="sticky bottom-0 mt-auto pb-6 pt-4 bg-gradient-to-t from-[color:var(--background)] via-[color:var(--background)] to-transparent">
          {!isSignedIn ? (
            <SignedOut>
              <div className="flex flex-col items-start gap-3 rounded-2xl border border-[color:var(--hairline,#e6dfd8)] p-4">
                <p className="text-sm text-[color:var(--muted)]">
                  Sign in to send a message. The chat surface above stays
                  visible either way.
                </p>
                <SignInButton mode="modal">
                  <button type="button" className="pill-outline">
                    Sign in to continue
                  </button>
                </SignInButton>
              </div>
            </SignedOut>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex items-end gap-2 rounded-full border border-[color:var(--hairline,#e6dfd8)] bg-[color:var(--background)] py-2 pl-5 pr-2"
            >
              <textarea
                aria-label="Message"
                value={input}
                onChange={(e) => setInput(e.currentTarget.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Ask Duyet anything…"
                className="flex-1 resize-none bg-transparent py-1.5 text-[15px] leading-6 text-[color:var(--foreground)] placeholder:text-[color:var(--muted)] focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || isBusy}
                aria-label="Send"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--foreground)] text-[color:var(--background)] transition-opacity disabled:opacity-40"
              >
                <ArrowUp size={16} aria-hidden="true" />
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

export function App() {
  return <ChatScreen />;
}
