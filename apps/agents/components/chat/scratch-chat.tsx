import { CornerDownLeft, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useClerkComponents } from "@/lib/hooks/use-clerk-components";

type Mode = "fast" | "agent";
type Role = "user" | "assistant";

interface ChatMessage {
  id: string;
  role: Role;
  content: string;
}

interface ChatResponse {
  conversationId: string;
  assistantText: string;
}

interface RecommendationResponse {
  questions: string[];
}

const FALLBACK_QUESTIONS = [
  "Summarize my latest work focus.",
  "Give me practical engineering priorities this week.",
  "What should I ship next on this site?",
  "Suggest high-impact Cloudflare Agent improvements.",
];

const HERO_VARIANTS = [
  "What's on your mind?",
  "What should we build next?",
  "What do you want to solve right now?",
  "What should we ship today?",
];

function getGreetingPrefix(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function ChatPanel({
  canSend,
  userId,
  getToken,
}: {
  canSend: boolean;
  userId?: string;
  getToken?: () => Promise<string | null>;
}) {
  const [mode, setMode] = useState<Mode>("agent");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [recommendations, setRecommendations] =
    useState<string[]>(FALLBACK_QUESTIONS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken) return;

    const loadRecommendations = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const response = await fetch("/api/recommendations?focus=ai", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) return;

        const payload = (await response.json()) as RecommendationResponse;
        if (payload.questions?.length) {
          setRecommendations(payload.questions.slice(0, 6));
        }
      } catch {
        // Keep fallback recommendations.
      }
    };

    void loadRecommendations();
  }, [getToken]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading || !canSend) return;

    setError(null);
    setLoading(true);
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: text },
    ]);
    setInput("");

    try {
      const token = getToken ? await getToken() : null;
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: text,
          sessionId: `agents-ui-${userId ?? "anonymous"}`,
          mode,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error || `Request failed (${response.status})`);
      }

      const payload = (await response.json()) as ChatResponse;
      setMessages((prev) => [
        ...prev,
        {
          id: payload.conversationId || crypto.randomUUID(),
          role: "assistant",
          content: payload.assistantText || "I could not generate a response.",
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 rounded-[28px] border border-[#0f172a]/12 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.06)] sm:p-6">
      <div className="rounded-2xl border border-[#0f172a]/10 bg-[#f8fafc] p-4">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask anything..."
          className="min-h-28 w-full resize-none bg-transparent text-lg text-[#0f172a] outline-none placeholder:text-[#64748b]"
        />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMode("fast")}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                mode === "fast"
                  ? "bg-[#0f172a] text-white"
                  : "border border-[#0f172a]/15 bg-white text-[#0f172a]"
              }`}
            >
              Fast
            </button>
            <button
              type="button"
              onClick={() => setMode("agent")}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                mode === "agent"
                  ? "bg-[#0f172a] text-white"
                  : "border border-[#0f172a]/15 bg-white text-[#0f172a]"
              }`}
            >
              Agent
            </button>
            <span className="inline-flex items-center gap-1 rounded-full border border-[#0f172a]/10 bg-white px-3 py-2 text-xs text-[#0f172a]/70">
              <Sparkles className="h-3.5 w-3.5" />
              CF AI Gateway
            </span>
          </div>

          <button
            type="button"
            onClick={() => void sendMessage()}
            disabled={!canSend || loading || input.trim().length === 0}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#0f172a] text-white disabled:cursor-not-allowed disabled:opacity-45"
            aria-label="Send message"
          >
            <CornerDownLeft className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {recommendations.map((question) => (
          <button
            key={question}
            type="button"
            onClick={() => setInput(question)}
            className="rounded-full border border-[#0f172a]/15 bg-white px-4 py-2 text-sm text-[#0f172a]/80 hover:bg-[#f8fafc]"
          >
            {question}
          </button>
        ))}
      </div>

      {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}

      <div className="mt-6 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-6 ${
              message.role === "user"
                ? "ml-auto bg-[#0f172a] text-white"
                : "bg-[#f8fafc] text-[#0f172a]"
            }`}
          >
            {message.content}
          </div>
        ))}
      </div>
    </div>
  );
}

function SignedInContent({
  heroVariant,
  useUser,
}: {
  heroVariant: string;
  useUser: NonNullable<ReturnType<typeof useClerkComponents>>["useUser"];
}) {
  const { user } = useUser();
  const prefix = getGreetingPrefix(new Date().getHours());
  const firstName = user?.firstName?.trim();

  const getToken = async () => {
    const clerk = (window as { Clerk?: { session?: { getToken: () => Promise<string | null> } } }).Clerk;
    if (!clerk?.session) return null;
    return clerk.session.getToken();
  };

  return (
    <>
      <div className="text-center">
        <h1 className="text-balance text-4xl font-semibold tracking-tight text-[#0f172a] sm:text-5xl">
          {firstName ? `${prefix}, ${firstName}.` : prefix}
        </h1>
        <p className="mt-3 text-lg font-medium text-[#0f172a]/85">{heroVariant}</p>
      </div>
      <ChatPanel canSend getToken={getToken} userId={user?.id} />
    </>
  );
}

export function ScratchChat() {
  const clerk = useClerkComponents();
  const heroVariant = useMemo(
    () => HERO_VARIANTS[Math.floor(Math.random() * HERO_VARIANTS.length)],
    []
  );

  if (!clerk) {
    const prefix = getGreetingPrefix(new Date().getHours());
    return (
      <main className="min-h-svh bg-[#f3f4f6] px-4 py-10 sm:px-6">
        <div className="mx-auto w-full max-w-5xl text-center">
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-[#0f172a] sm:text-5xl">
            {prefix}
          </h1>
          <p className="mt-3 text-lg font-medium text-[#0f172a]/85">{heroVariant}</p>
        </div>
      </main>
    );
  }

  const { SignedIn, SignedOut, SignInButton, useUser } = clerk;
  const prefix = getGreetingPrefix(new Date().getHours());

  return (
    <main className="min-h-svh bg-[#f3f4f6] px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-5xl">
        <SignedOut>
          <div className="text-center">
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-[#0f172a] sm:text-5xl">
              {prefix}
            </h1>
            <p className="mt-3 text-lg font-medium text-[#0f172a]/85">{heroVariant}</p>
          </div>

          <div className="mt-8 rounded-[28px] border border-[#0f172a]/12 bg-white p-6 text-center">
            <p className="text-sm text-[#0f172a]/70">
              Sign in is required to send.
            </p>
            <div className="mt-4">
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="rounded-full bg-[#0f172a] px-5 py-2.5 text-sm font-medium text-white"
                >
                  Sign in to chat
                </button>
              </SignInButton>
            </div>
            <ChatPanel canSend={false} />
          </div>
        </SignedOut>

        <SignedIn>
          <SignedInContent heroVariant={heroVariant} useUser={useUser} />
        </SignedIn>
      </div>
    </main>
  );
}
