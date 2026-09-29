/**
 * The page header: eyebrow, the one-sentence title, the standfirst, and the
 * "last updated" stamp with its source list.
 *
 * Split out of the route because it is the only part of the page that depends
 * on the *absence* of data (`generatedAt === null` renders a plain "Last 30
 * days"), and that fallback was previously buried in the same ternary chain as
 * the date format.
 */
import { Eyebrow } from "@duyet/components";

function OverviewHeader({ generatedAt }: { generatedAt: string | null }) {
  return (
    <>
      {/* ---- Header ---- */}
      <Eyebrow>Insights · Last 30 days</Eyebrow>
      <h1 className="text-[clamp(2rem,4.6vw,3.4rem)] font-semibold tracking-[-0.04em] mt-[18px] max-w-[20ch]">
        A quiet view of what shipped, what ran, and what was read.
      </h1>
      <p
        className="rd-lead mt-5 max-w-[64ch]"
      >
        One editorial page across coding time, AI usage, traffic, and the
        most-read posts. No dashboards, no chrome — just the numbers and
        what they meant this month.
      </p>
      <div
        className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-xs mt-4"
      >
        {generatedAt
          ? `Last updated ${generatedAt}`
          : `Last 30 days`}{" "}
        · sources: Cloudflare, PostHog, ClickHouse, WakaTime
      </div>
    </>
  );
}

export { OverviewHeader };
