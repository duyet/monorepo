import { createFileRoute } from "@tanstack/react-router";
import { AnimatedCounter } from "../components/AnimatedCounter";
import { DailyChart } from "../components/DailyChart";
import { TokenBreakdown } from "../components/TokenBreakdown";
import { readPublicJson } from "../lib/read-public-json";
import type { TokenData } from "../lib/types";
import { SourceIcons } from "../components/SourceIcons";

export const Route = createFileRoute("/")({
  loader: async () => {
    const data = await readPublicJson<TokenData>("token-data.json");
    return data;
  },
  component: Page,
});

function Page() {
  const data = Route.useLoaderData();

  return (
    <div style={{
      display: "flex",
      height: "100dvh",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
      padding: "24px",
      boxSizing: "border-box",
      overflow: "hidden",
    }}>
      <div className="animate-fade-in">
        <AnimatedCounter target={data.totals.total_tokens} />
        <p style={{
          marginTop: 8,
          textAlign: "center",
          fontSize: 11,
          letterSpacing: "0.04em",
          color: "var(--muted)",
          lineHeight: 1.4,
        }}>
          tokens consumed by
        </p>
        <SourceIcons sources={data.sources} />
      </div>

      <div className="animate-fade-in-delay">
        <TokenBreakdown totals={data.totals} />
      </div>

      <DailyChart daily={data.daily} firstDate={data.firstDate} lastDate={data.lastDate} />
    </div>
  );
}
