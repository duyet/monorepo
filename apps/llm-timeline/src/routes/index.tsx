import { createFileRoute } from "@tanstack/react-router";
import { Eyebrow, Reveal } from "@duyet/components";
import { StaticView } from "@/components/StaticView";
import { lastSynced, models, years } from "@/lib/data";
import { getStats } from "@/lib/utils";

const stats = getStats(models);
const firstYear = years[years.length - 1];
const latestYear = years[0];

export const Route = createFileRoute("/")({
  component: LLMTimelinePage,
});

function LLMTimelinePage() {
  return (
    <div className="space-y-8">
      {/* Hero — mirrors the home (duyet.net) brand treatment */}
      <Reveal>
        <header className="pt-[clamp(6px,1.5vw,16px)]">
          <Eyebrow>LLM TIMELINE</Eyebrow>
          <h1 className="rd-display mt-[13px] max-w-[20ch] text-[clamp(2.05rem,4.2vw,3.3rem)] leading-[1.02]">
            Every language model, from{" "}
            <span className="text-[var(--rd-accent)]">
              {firstYear}&ndash;{latestYear}
            </span>
            .
          </h1>
          <p className="rd-lead mt-4 max-w-[60ch] text-[clamp(0.96rem,1.15vw,1.06rem)]">
            An interactive timeline of {stats.models.toLocaleString()} language
            model releases from {stats.organizations.toLocaleString()}+
            organizations. Search, filter by license, and compare models side by
            side.
          </p>
          <p className="mt-3 font-[family-name:var(--font-mono)] text-xs text-[var(--rd-text-3)]">
            Updated {lastSynced}
          </p>
        </header>
      </Reveal>

      <Reveal delay={100}>
        <StaticView
          models={models}
          stats={{
            models: stats.models,
            organizations: stats.organizations,
          }}
          sourceStats={stats.sources}
          view="models"
          license="all"
        />
      </Reveal>
    </div>
  );
}
