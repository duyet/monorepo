import { createFileRoute } from "@tanstack/react-router";
import { Pipeline } from "../components/Pipeline";
import { Playbook } from "../components/Playbook";
import { ScorePlayground } from "../components/ScorePlayground";
import { ShareBar } from "../components/ShareBar";
import { WeightBars } from "../components/WeightBars";
import { PARAM_SYNC, SOURCE_REPO } from "../lib/scoring";

export const Route = createFileRoute("/")({
  component: Page,
});

function Page() {
  return (
    <article className="space-y-16">
      <header className="border-b border-border pb-10 pt-6">
        <p className="mb-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          For You · open-sourced 2026
        </p>
        <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          X ranks posts by what it thinks you will do next.
        </h1>
        <p className="mt-5 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground">
          Copy-link is 40× a like. One report wipes about 468 likes. This
          page is the production weights from{" "}
          <a className="underline underline-offset-4" href={SOURCE_REPO}>
            xai-org/x-algorithm
          </a>
          , last synced {PARAM_SYNC}.
        </p>
        <div className="mt-6">
          <ShareBar />
        </div>
      </header>

      <Pipeline />
      <ScorePlayground />
      <WeightBars />
      <Playbook />

      <footer className="border-t border-border pt-6 text-sm leading-6 text-muted-foreground">
        <p>
          Numbers are the published defaults in{" "}
          <code className="font-mono text-xs">home-mixer/params/param.rs</code>{" "}
          and the arithmetic in{" "}
          <code className="font-mono text-xs">
            home-mixer/scorers/ranking_scorer.rs
          </code>
          . Experiments can override them. Grox prompts and some Botmaker rules
          are not in the repo.
        </p>
        <p className="mt-2">
          Source:{" "}
          <a className="underline underline-offset-4" href={SOURCE_REPO}>
            github.com/xai-org/x-algorithm
          </a>
          . Built to be posted.
        </p>
      </footer>
    </article>
  );
}
