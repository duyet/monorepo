import {
  CornerDownLeft,
  Search,
  Globe,
  Mic,
  Plus,
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
  "What should I explore first on duyet.net?",
  "Show projects about data engineering and AI agents.",
  "Which app should I open for analytics and insights?",
  "Summarize Duyet Le's current work focus.",
];

const AGENTS_BASE_URL =
  import.meta.env.VITE_DUYET_AGENTS_URL || "https://agents.duyet.net";
const AI_SEARCH_API_URL =
  import.meta.env.VITE_AI_SEARCH_API_URL ||
  "https://84249c5c-c9b2-418d-8f03-ab3335997606.search.ai.cloudflare.com/";

export function HomeAgentsChat() {
  const [clerk, setClerk] = useState<ClerkModule | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [recommendations, setRecommendations] =
    useState<string[]>(FALLBACK_QUESTIONS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    import("@cloudflare/ai-search-snippet").catch(() => undefined);
  }, []);

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
      <section className="mx-auto my-6 max-w-[1280px] px-5 sm:my-8 sm:px-8 lg:px-10">
        <div className="flex justify-center">
          <HeroHeading />
        </div>
      </section>
    );
  }

  const { SignedIn, SignedOut, useAuth, useUser } = clerk;

  function HeroHeading() {
    return (
      <div className="home-ai-search mx-auto w-full max-w-2xl">
        <search-bar-snippet
          className="home-ai-search-snippet"
          api-url={AI_SEARCH_API_URL}
          placeholder="Search..."
          maxResults={50}
          maxRenderResults={10}
          show-url="true"
          show-date="true"
        />
      </div>
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
            `${AGENTS_BASE_URL}/api/recommendations?focus=ai`,
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
        const response = await fetch(`${AGENTS_BASE_URL}/api/chat`, {
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
        <form
          className="border-b border-[#1a1a1a]/10 p-4"
          onSubmit={async (event) => {
            event.preventDefault();
            if (loading) return;
            await sendMessage(input);
          }}
        >
          <div className="mx-auto flex w-full max-w-5xl items-center gap-3 rounded-[30px] border border-[#cbd5e1] bg-[#f8fafc] px-4 py-3">
            <Search className="h-6 w-6 shrink-0 text-[#1f2937]" />
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Type a message..."
              className="h-10 w-full bg-transparent text-3xl leading-tight text-[#374151] outline-none placeholder:text-[#6b7280]"
            />
            <button
              type="submit"
              disabled={loading || input.trim().length === 0}
              className="rounded-3xl bg-[#f58a1f] px-7 py-3 text-2xl font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Search
            </button>
          </div>
        </form>

        <div className="h-[240px] overflow-y-auto px-4 py-4">
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
    <section className="mx-auto my-6 max-w-[1280px] px-5 sm:my-8 sm:px-8 lg:px-10">
      <div className="flex justify-center">
        <HeroHeading />
      </div>

      <div className="mt-4">
        <SignedOut />

        <SignedIn>
          <SignedInChat />
        </SignedIn>
      </div>
    </section>
  );
}
