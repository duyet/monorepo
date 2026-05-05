import { Expand, Shrink } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type ClerkModule = typeof import("@clerk/clerk-react");

export function HomeAgentsChat() {
  const [clerk, setClerk] = useState<ClerkModule | null>(null);
  const [message, setMessage] = useState("");
  const [expanded, setExpanded] = useState(false);

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

  const { SignedIn, SignedOut, SignInButton } = clerk;

  return (
    <section className="mx-auto mt-16 max-w-[1280px] px-5 sm:px-8 lg:mt-20 lg:px-10">
      <div className="rounded-xl border border-[#1a1a1a]/10 bg-[#f3eee6] p-5 lg:p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold tracking-tight">Chat with duyetbot</h3>
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
        <p className="mt-2 text-sm text-[#1a1a1a]/70">
          Ask from the homepage. Sign in is required to send.
        </p>

        <div className="mt-4 space-y-3">
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Ask about projects, tooling, or infrastructure..."
            className={`w-full rounded-xl border border-[#1a1a1a]/15 bg-white p-3 text-sm text-[#1a1a1a] outline-none focus:border-[#1a1a1a]/40 ${
              expanded ? "min-h-56" : "min-h-16"
            }`}
          />

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-lg bg-[#1a1a1a] px-4 py-2 text-sm font-medium text-white opacity-50"
              title="Send is disabled on homepage"
            >
              Send
            </button>

            <SignedOut>
              <SignInButton mode="modal" forceRedirectUrl="https://duyet.net">
                <button
                  type="button"
                  className="rounded-lg border border-[#1a1a1a]/15 bg-white px-4 py-2 text-sm font-medium text-[#1a1a1a]"
                >
                  Sign in
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <button
                type="button"
                onClick={() => window.open("https://agents.duyet.net", "_blank")}
                className="rounded-lg border border-[#1a1a1a]/15 bg-white px-4 py-2 text-sm font-medium text-[#1a1a1a]"
              >
                Open full chat
              </button>
            </SignedIn>
          </div>
        </div>
      </div>
    </section>
  );
}
