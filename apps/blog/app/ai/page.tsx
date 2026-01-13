import type { Metadata } from "next";
import Container from "@duyet/components/Container";

export const metadata: Metadata = {
  title: "AI",
  description: "How I use AI.",
};

export default function AI() {
  return (
    <div className="mb-16 space-y-6 leading-loose">
      <Container className="mb-8 max-w-2xl md:mb-16">
        <h1 className="my-10 text-6xl font-bold lg:text-7xl">AI</h1>
        <p>
          None of the contents in my blog was written by an AI tool. I have used
          AI for <del>English sentences correction</del>, now I use AI agent for
          English corrections and do the review.
        </p>

        <p>
          I use different LLM tools for coding, mostly Claude Code + NeoVim.
        </p>

        <p>Latest: Claude Code, opencode, ZAI, Grok.</p>
      </Container>
    </div>
  );
}
