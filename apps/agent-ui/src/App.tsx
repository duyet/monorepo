import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useAuth,
} from "@clerk/clerk-react";
import { useChat } from "@ai-sdk/react";
import { SiteFooter, SiteHeader } from "@duyet/components";
import type { UIMessage } from "ai";
import { useCallback, useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "~/components/chatbot/alert";
import { ChatConversation } from "~/components/chatbot/chat";
import { PromptForm } from "~/components/chatbot/prompt-form";
import {
  AgentApiTransport,
  type AgentChatResponse,
} from "./agent-api-transport";

const SESSION_STORAGE_KEY = "duyet-agent-ui-session-id";

const AGENT_NAV = [
  { label: "Chat", href: "/" },
  { label: "API", href: "https://api.duyet.net", external: true },
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

function ChatScreen() {
  const { getToken, isSignedIn } = useAuth();
  const [sessionId, setSessionId] = useState(readSessionId);
  const [, setLastResponse] = useState<AgentChatResponse | null>(null);

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

  const { error, messages, sendMessage, setMessages, status, stop } =
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

  const submit = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isBusy || !isSignedIn) return;
      void sendMessage({ text: trimmed });
    },
    [isBusy, isSignedIn, sendMessage],
  );

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <SiteHeader currentApp="agents" localNav={AGENT_NAV} activeHref="/" />

      <main className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col">
        <ChatConversation
          messages={messages}
          isBusy={isBusy}
          canSubmit={Boolean(isSignedIn) && !isBusy}
          onSelectSuggestion={submit}
        />

        <div className="mx-auto flex w-full max-w-2xl flex-col gap-2 px-6 pb-6">
          {error ? (
            <Alert variant="destructive">
              <AlertTitle>Request failed</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          ) : null}

          {!isSignedIn ? (
            <SignedOut>
              <div className="flex flex-col items-start gap-3 rounded-2xl border p-4">
                <p className="text-sm text-muted-foreground">
                  Sign in to send a message. The chat surface above stays
                  visible either way.
                </p>
                <SignInButton mode="modal">
                  <Button variant="outline">Sign in to continue</Button>
                </SignInButton>
              </div>
            </SignedOut>
          ) : (
            <PromptForm
              isBusy={isBusy}
              placeholder="Ask Duyet anything…"
              onSubmit={submit}
              onStop={() => stop()}
              extra={
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={resetSession}
                    className="rounded-full text-muted-foreground"
                  >
                    New chat
                  </Button>
                  <SignedIn>
                    <UserButton />
                  </SignedIn>
                </>
              }
            />
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

export function App() {
  return <ChatScreen />;
}
