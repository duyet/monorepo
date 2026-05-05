import {
  CornerDownLeft,
  Expand,
  Globe,
  Mic,
  Plus,
  Shrink,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type ClerkModule = typeof import("@clerk/clerk-react");

type Role = "user" | "assistant";

interface ChatMessage {
  id: string;
  role: Role;
  content: string;
}

interface ChatResponse {
  sessionId: string;
  conversationId: string;
  assistantText: string;
}

interface RecommendationResponse {
  questions: string[];
}

const FALLBACK_QUESTIONS = [
  "What are practical AI architecture patterns?",
  "How should I improve this homepage UX?",
  "What should I monitor after deploy?",
  "Show me Cloudflare Agents best practices.",
];

function getGreetingPrefix(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function HomeAgentsChat() {
  const [clerk, setClerk] = useState<ClerkModule | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [recommendations, setRecommendations] =
    useState<string[]>(FALLBACK_QUESTIONS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    import("@clerk/clerk-react")
      .then((mod) => setClerk(mod))
      .catch(() => setClerk(null));
  }, []);

  const keyExists = useMemo(
    () => Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY),
    []
  );

  if (!keyExists || !clerk) {
    return (
      <section className="mx-auto mt-6 max-w-[1280px] px-5 sm:px-8 lg:mt-8 lg:px-10">
        <div className="rounded-xl border border-[#1a1a1a]/10 bg-[#f3eee6] p-5 lg:p-6">
          <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {getGreetingPrefix(new Date().getHours())}
          </h3>
          <p className="mt-2 text-sm text-[#1a1a1a]/70">
            Auth is not configured on this environment.
          </p>
        </div>
      </section>
    );
  }

  const { SignedIn, SignedOut, SignInButton, useAuth, useUser } = clerk;

  function HeroHeading() {
    const { user } = useUser();
    const hour = new Date().getHours();
    const prefix = getGreetingPrefix(hour);
    const firstName = user?.firstName?.trim();

    return (
      <>
        <h3 className="text-2xl font-semibold tracking-tight sm:text-4xl">
          {firstName ? `${prefix}, ${firstName}.` : prefix}
        </h3>
      </>
    );
  }

  function SignedInChat() {
    const { getToken } = useAuth();
    const { user } = useUser();

    useEffect(() => {
      const loadRecommendations = async () => {
        try {
          const token = await getToken();
          if (!token) return;

          const res = await fetch(
            "https://agents.duyet.net/api/recommendations?focus=ai",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (!res.ok) return;

          const payload = (await res.json()) as RecommendationResponse;
          if (Array.isArray(payload.questions) && payload.questions.length > 0) {
            setRecommendations(payload.questions.slice(0, 8));
          }
        } catch {
          // Keep fallback recommendations.
        }
      };

      loadRecommendations();
    }, [getToken]);

    const sendMessage = async (content: string) => {
      const text = content.trim();
      if (!text) return;

      const token = await getToken();
      if (!token) {
        setError("Authentication token is missing.");
        return;
      }

      const nextUserMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
      };

      setMessages((prev) => [...prev, nextUserMessage]);
      setInput("");
      setError(null);
      setLoading(true);

      try {
        const sessionId = `home-${user?.id ?? "unknown-user"}`;
        const response = await fetch("https://agents.duyet.net/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: text,
            sessionId,
          }),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(payload?.error || `Request failed with ${response.status}`);
        }

        const payload = (await response.json()) as ChatResponse;
        const assistantMessage: ChatMessage = {
          id: payload.conversationId || crypto.randomUUID(),
          role: "assistant",
          content: payload.assistantText || "I couldn't generate a response.",
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send message.");
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="mt-4 rounded-2xl border border-[#1a1a1a]/10 bg-white">
        <div className={`overflow-y-auto px-4 py-4 ${expanded ? "h-[440px]" : "h-[240px]"}`}>
          {messages.length === 0 ? (
            <div className="rounded-xl border border-[#1a1a1a]/10 bg-[#faf9f6] p-4 text-sm text-[#1a1a1a]/70">
              Ask anything about projects, architecture, Cloudflare Agents, or data systems.
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                    message.role === "user"
                      ? "ml-auto bg-[#1a1a1a] text-white"
                      : "bg-[#f7f6f3] text-[#1a1a1a]"
                  }`}
                >
                  {message.content}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-[#1a1a1a]/10 px-3 py-3">
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
            {recommendations.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => setInput(question)}
                className="shrink-0 rounded-full border border-[#1a1a1a]/15 bg-[#f8f8f8] px-3 py-1.5 text-xs font-medium text-[#1a1a1a]/85 hover:bg-[#f1f1f1]"
              >
                {question}
              </button>
            ))}
          </div>

          <form
            className="space-y-2"
            onSubmit={async (event) => {
              event.preventDefault();
              if (loading) return;
              await sendMessage(input);
            }}
          >
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="What would you like to know?"
              className="min-h-24 w-full resize-none rounded-xl border border-[#1a1a1a]/15 bg-white p-3 text-sm text-[#1a1a1a] outline-none focus:border-[#1a1a1a]/40"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-[#1a1a1a]/60">
                <button type="button" className="rounded p-1 hover:bg-[#f5f5f5]" title="Add">
                  <Plus className="h-4 w-4" />
                </button>
                <button type="button" className="rounded p-1 hover:bg-[#f5f5f5]" title="Voice">
                  <Mic className="h-4 w-4" />
                </button>
                <button type="button" className="rounded p-1 hover:bg-[#f5f5f5]" title="Search">
                  <Globe className="h-4 w-4" />
                </button>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#f5f5f5] px-2 py-1 text-xs">
                  <Sparkles className="h-3 w-3" /> GPT-4o
                </span>
              </div>

              <button
                type="submit"
                disabled={loading || input.trim().length === 0}
                className="inline-flex items-center justify-center rounded-xl bg-[#1a1a1a] px-3 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
                title="Send"
              >
                <CornerDownLeft className="h-4 w-4" />
              </button>
            </div>
          </form>

          {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <section className="mx-auto mt-6 max-w-[1280px] px-5 sm:px-8 lg:mt-8 lg:px-10">
      <div className="rounded-xl border border-[#1a1a1a]/10 bg-[#f3eee6] p-5 lg:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <HeroHeading />
          </div>
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="inline-flex items-center justify-center rounded-lg border border-[#1a1a1a]/15 bg-white p-2 text-[#1a1a1a] transition-colors hover:bg-[#f9f9f9]"
            aria-label={expanded ? "Collapse chat box" : "Expand chat box"}
            title={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <Shrink className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
          </button>
        </div>

        <SignedOut>
          <div className="mt-4 rounded-2xl border border-[#1a1a1a]/10 bg-white p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {FALLBACK_QUESTIONS.map((question) => (
                <span
                  key={question}
                  className="rounded-full border border-[#1a1a1a]/15 bg-[#f8f8f8] px-3 py-1.5 text-xs font-medium text-[#1a1a1a]/75"
                >
                  {question}
                </span>
              ))}
            </div>
            <SignInButton mode="modal" forceRedirectUrl="https://duyet.net">
              <button
                type="button"
                className="rounded-lg bg-[#1a1a1a] px-4 py-2 text-sm font-medium text-white"
              >
                Sign in to start chatting
              </button>
            </SignInButton>
          </div>
        </SignedOut>

        <SignedIn>
          <SignedInChat />
        </SignedIn>
      </div>
    </section>
  );
}
