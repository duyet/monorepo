import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useAuth,
} from "@clerk/clerk-react";
import { useChat } from "@ai-sdk/react";
import { Button } from "~/components/ui/button";
import { SiteFooter, SiteHeader } from "@duyet/components";
import type { UIMessage } from "ai";
import { Sparkles } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "~/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "~/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
} from "~/components/ai-elements/prompt-input";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "~/components/ai-elements/reasoning";
import { Suggestion, Suggestions } from "~/components/ai-elements/suggestion";
import {
  AgentApiTransport,
  type AgentChatResponse,
} from "./agent-api-transport";

const SESSION_STORAGE_KEY = "duyet-agent-ui-session-id";

// Custom in-app menu shown next to the shared app switcher in the header.
const AGENT_NAV = [
  { label: "Chat", href: "/" },
  { label: "API", href: "https://api.duyet.net", external: true },
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

/** Render a single UIMessage's parts as ai-elements (reasoning + markdown). */
function MessageParts({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  return (
    <>
      {message.parts.map((part, index) => {
        if (part.type === "reasoning" && part.text) {
          return (
            <Reasoning
              key={`r-${index}`}
              className="mb-2 w-full"
              isStreaming={false}
            >
              <ReasoningTrigger />
              <ReasoningContent>{part.text}</ReasoningContent>
            </Reasoning>
          );
        }
        if (part.type === "text" && part.text) {
          return isUser ? (
            <span
              key={`t-${index}`}
              className="whitespace-pre-wrap break-words"
            >
              {part.text}
            </span>
          ) : (
            <MessageResponse key={`t-${index}`}>{part.text}</MessageResponse>
          );
        }
        return null;
      })}
    </>
  );
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

  const submit = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isBusy || !isSignedIn) return;
      void sendMessage({ text: trimmed });
    },
    [isBusy, isSignedIn, sendMessage]
  );

  const handlePromptSubmit = useCallback(
    (message: PromptInputMessage) => {
      if (message.text) submit(message.text);
    },
    [submit]
  );

  const empty = messages.length === 0;

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <SiteHeader currentApp="agents" localNav={AGENT_NAV} activeHref="/" />

      <main className="mx-auto flex w-full max-w-[768px] flex-1 flex-col px-4 sm:px-6">
        <Conversation className="flex-1">
          <ConversationContent className="gap-6 py-8">
            {empty ? (
              <ConversationEmptyState
                className="py-16"
                icon={<Sparkles className="size-6" />}
                title="Ask Duyet anything."
                description="An agent grounded in my blog, projects, and public data — conversational and streaming."
              >
                <Suggestions className="mt-4 justify-center">
                  {SUGGESTIONS.map((prompt) => (
                    <Suggestion
                      key={prompt}
                      suggestion={prompt}
                      onClick={submit}
                      disabled={!isSignedIn || isBusy}
                    />
                  ))}
                </Suggestions>
              </ConversationEmptyState>
            ) : (
              <>
                {messages.map((message) => (
                  <Message key={message.id} from={message.role}>
                    <MessageContent>
                      <MessageParts message={message} />
                    </MessageContent>
                  </Message>
                ))}
                {error ? (
                  <p className="text-sm text-destructive">{error.message}</p>
                ) : null}
              </>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className="sticky bottom-0 mt-auto pb-6 pt-2">
          {!isSignedIn ? (
            <SignedOut>
              <div className="flex flex-col items-start gap-3 rounded-xl border p-4">
                <p className="text-sm text-muted-foreground">
                  Sign in to send a message. The chat surface above stays
                  visible either way.
                </p>
                <SignInButton mode="modal">
                  <Button variant="outline" className="rounded-full">
                    Sign in to continue
                  </Button>
                </SignInButton>
              </div>
            </SignedOut>
          ) : (
            <PromptInput onSubmit={handlePromptSubmit}>
              <PromptInputBody>
                <PromptInputTextarea placeholder="Ask Duyet anything…" />
              </PromptInputBody>
              <PromptInputFooter className="justify-between">
                <div className="flex items-center gap-1">
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
                </div>
                <PromptInputSubmit status={status} />
              </PromptInputFooter>
            </PromptInput>
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
