import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useAuth,
} from "@clerk/clerk-react";
import { useChat } from "@ai-sdk/react";
import ThemeToggle from "@duyet/components/ThemeToggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@duyet/components/ui/card";
import { Badge } from "@duyet/components/ui/badge";
import { Button } from "@duyet/components/ui/button";
import { ScrollArea } from "@duyet/components/ui/scroll-area";
import { Separator } from "@duyet/components/ui/separator";
import { Textarea } from "@duyet/components/ui/textarea";
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
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <article
        className={`flex w-[min(100%,42rem)] flex-col gap-2 rounded-lg border p-4 text-sm leading-6 ${
          isUser
            ? "border-primary bg-primary text-primary-foreground"
            : "bg-background text-foreground"
        }`}
      >
        <Badge
          className="w-fit"
          variant={isUser ? "secondary" : "outline"}
        >
          {isUser ? "You" : "Agent"}
        </Badge>
        <p className="whitespace-pre-wrap break-words">{text}</p>
      </article>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[18rem] flex-col items-center justify-center gap-3 text-center">
      <Sparkles aria-hidden="true" className="size-5" />
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">Duyet Agents</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Ask about Duyet Le, duyet.net, projects, posts, and data work.
        </p>
      </div>
    </div>
  );
}

function ResponseStatus({ response }: { response: AgentChatResponse | null }) {
  if (!response) {
    return <Badge variant="outline">ready</Badge>;
  }

  const pendingCount = response.pendingInteractions?.length ?? 0;

  return (
    <>
      <Badge variant="outline">{response.authMode ?? "clerk"}</Badge>
      <Badge variant="secondary">{response.status ?? "ready"}</Badge>
      {pendingCount > 0 ? (
        <Badge variant="secondary">{pendingCount} pending</Badge>
      ) : null}
    </>
  );
}

function ChatScreen() {
  const { getToken, isSignedIn } = useAuth();
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
    if (!text || isBusy || !isSignedIn) return;

    setInput("");
    void sendMessage({ text });
  }

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col gap-4 px-4 py-4 sm:px-6">
        <header className="flex min-h-14 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Sparkles aria-hidden="true" className="size-5 shrink-0" />
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold">Duyet Agents</h1>
              <p className="truncate text-xs text-muted-foreground">
                Simple chat over duyet.net context
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden items-center gap-2 sm:flex">
              <ResponseStatus response={lastResponse} />
            </div>
            <ThemeToggle />
            <Button
              aria-label="Reset conversation"
              onClick={resetSession}
              size="icon"
              type="button"
              variant="outline"
            >
              <RotateCcw aria-hidden="true" data-icon="inline-start" />
            </Button>
            <SignedOut>
              <SignInButton mode="modal">
                <Button type="button" variant="outline">
                  Sign in
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </header>

        <Card className="flex min-h-0 flex-1 flex-col overflow-hidden shadow-none">
          <CardHeader className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-1">
                <CardTitle className="text-base">Chat</CardTitle>
                <CardDescription>
                  {isSignedIn
                    ? "Ask a question and keep the session in this browser."
                    : "You can view the full chat surface. Sign in to send a message."}
                </CardDescription>
              </div>
              <Badge variant={isSignedIn ? "secondary" : "outline"}>
                {isSignedIn ? "signed in" : "signed out"}
              </Badge>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="min-h-0 flex-1 p-0">
            <ScrollArea className="h-full">
              <div className="flex min-h-[calc(100dvh-17rem)] flex-col gap-3 p-4">
                {messages.length === 0 ? (
                  <EmptyState />
                ) : (
                  messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))
                )}
                {error ? (
                  <Badge
                    className="w-fit max-w-full whitespace-normal rounded-md py-2"
                    variant="destructive"
                  >
                    {error.message}
                  </Badge>
                ) : null}
              </div>
            </ScrollArea>
          </CardContent>

          <Separator />

          <CardFooter className="p-4">
            <form className="flex w-full items-end gap-2" onSubmit={handleSubmit}>
              <Textarea
                aria-label="Message"
                className="min-h-11 resize-none"
                onChange={(event) => setInput(event.currentTarget.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                placeholder={
                  isSignedIn ? "Ask Duyet Agents" : "Sign in to send a message"
                }
                rows={1}
                value={input}
              />
              {isSignedIn ? (
                <Button
                  aria-label="Send message"
                  disabled={!input.trim() || isBusy}
                  size="icon"
                  type="submit"
                >
                  <Send aria-hidden="true" data-icon="inline-start" />
                </Button>
              ) : (
                <SignInButton mode="modal">
                  <Button aria-label="Sign in to send" size="icon" type="button">
                    <Send aria-hidden="true" data-icon="inline-start" />
                  </Button>
                </SignInButton>
              )}
            </form>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}

export function App() {
  return <ChatScreen />;
}
