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
    <div className="mx-auto mb-16 max-w-[820px] space-y-6 leading-loose">
      <div className="mb-8 pt-10 md:mb-16 sm:pt-14 lg:pt-20">
        <h1 className="text-4xl font-semibold tracking-tight text-[#1a1a1a] dark:text-[#f8f8f2] sm:text-5xl lg:text-6xl">
          AI
        </h1>
        <div className="mt-8 space-y-5 text-lg font-medium leading-7 tracking-tight text-[#1a1a1a]/70 dark:text-[#f8f8f2]/70">
          <p>
            None of the contents in my blog was written by an AI tool. I have
            used AI for{" "}
            <del>English sentences correction</del>, now I use AI agent for
            English corrections and do the review.
          </p>
          <p>
            I use different LLM tools for coding, mostly Claude Code + NeoVim.
          </p>
          <p>Latest: Claude Code, opencode, ZAI, Grok.</p>
        </div>
      </div>
    </div>
  );
}
