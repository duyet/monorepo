import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/ai")({
  head: () => ({
    meta: [
      { title: "AI | Tôi là Duyệt" },
      { name: "description", content: "How I use AI." },
    ],
  }),
  component: AI,
});

function AI() {
  return (
    <div className="px-6 md:px-8">
      <header className="em-masthead">
        <span className="em-masthead__eyebrow">Editorial note</span>
        <h1 className="em-masthead__title">On AI</h1>
      </header>

      <div className="mx-auto max-w-2xl space-y-5 text-[15px] leading-7 text-[color:var(--em-muted)]">
        <p>
          None of the contents in my blog was written by an AI tool. I used to
          rely on AI for{" "}
          <del className="decoration-[color:var(--em-subtle)]">
            English sentence corrections
          </del>
          ; now I use an AI agent for English corrections and do the review
          myself.
        </p>
        <p>
          I use different LLM tools for coding, mostly Claude Code + NeoVim.
        </p>
        <p className="text-[color:var(--em-foreground)]">
          Latest: Claude Code, opencode, ZAI, Grok.
        </p>
      </div>
    </div>
  );
}
