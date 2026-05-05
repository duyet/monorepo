import { useEffect, useMemo, useState } from "react";

type ClerkModule = typeof import("@clerk/clerk-react");

interface ChatResult {
  sessionId: string;
  conversationId: string;
  assistantText: string;
}

export function HomeAgentsChat() {
  const [clerk, setClerk] = useState<ClerkModule | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ChatResult | null>(null);
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
      <section className="mx-auto mt-16 max-w-[1280px] px-5 sm:px-8 lg:mt-20 lg:px-10">
        <div className="rounded-xl border border-[#1a1a1a]/10 bg-[#f3eee6] p-5 lg:p-6">
          <h3 className="text-lg font-semibold tracking-tight">Chat with duyetbot</h3>
          <p className="mt-2 text-sm text-[#1a1a1a]/70">
            Auth is not configured on this environment.
          </p>
        </div>
      </section>
    );
  }

  const { SignedIn, SignedOut, SignInButton, useAuth } = clerk;

  function SignedInComposer() {
    const { getToken } = useAuth();

    const submit = async (content: string) => {
      const token = await getToken();
      if (!token) {
        setError("Authentication token is missing.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch("https://agents.duyet.net/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: content,
            sessionId: "home-chat",
          }),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(payload?.error || `Request failed with ${response.status}`);
        }

        const payload = (await response.json()) as ChatResult;
        setResult(payload);
        setMessage("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send message.");
      } finally {
        setLoading(false);
      }
    };

    return (
      <form
        className="mt-4 space-y-3"
        onSubmit={async (event) => {
          event.preventDefault();
          const content = message.trim();
          if (!content) return;
          await submit(content);
        }}
      >
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Ask about projects, tooling, or infrastructure..."
          className="min-h-24 w-full rounded-xl border border-[#1a1a1a]/15 bg-white p-3 text-sm text-[#1a1a1a] outline-none focus:border-[#1a1a1a]/40"
        />
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={loading || message.trim().length === 0}
            className="rounded-lg bg-[#1a1a1a] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Sending..." : "Send"}
          </button>
          <a
            href={
              result?.conversationId
                ? `https://agents.duyet.net/agents/chat-agent/${encodeURIComponent(result.sessionId)}`
                : "https://agents.duyet.net"
            }
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-[#1a1a1a]/15 bg-white px-4 py-2 text-sm font-medium text-[#1a1a1a]"
          >
            Open full chat
          </a>
        </div>
        {error && <p className="text-sm text-red-700">{error}</p>}
        {result?.assistantText && (
          <div className="rounded-xl border border-[#1a1a1a]/10 bg-white p-3 text-sm leading-6 text-[#1a1a1a]">
            {result.assistantText}
          </div>
        )}
      </form>
    );
  }

  return (
    <section className="mx-auto mt-16 max-w-[1280px] px-5 sm:px-8 lg:mt-20 lg:px-10">
      <div className="rounded-xl border border-[#1a1a1a]/10 bg-[#f3eee6] p-5 lg:p-6">
        <h3 className="text-lg font-semibold tracking-tight">Chat with duyetbot</h3>
        <p className="mt-2 text-sm text-[#1a1a1a]/70">
          Ask from the homepage. Sign in is required to send.
        </p>

        <SignedOut>
          <div className="mt-4 space-y-3">
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Type your message..."
              className="min-h-24 w-full rounded-xl border border-[#1a1a1a]/15 bg-white p-3 text-sm text-[#1a1a1a]"
            />
            <SignInButton mode="modal" forceRedirectUrl="https://duyet.net">
              <button
                type="button"
                className="rounded-lg bg-[#1a1a1a] px-4 py-2 text-sm font-medium text-white"
              >
                Sign in to send
              </button>
            </SignInButton>
          </div>
        </SignedOut>

        <SignedIn>
          <SignedInComposer />
        </SignedIn>
      </div>
    </section>
  );
}
