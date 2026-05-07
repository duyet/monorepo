import { createFileRoute } from "@tanstack/react-router";
import { AnimatedCounter } from "../components/AnimatedCounter";
import { DailyChart } from "../components/DailyChart";
import { TokenBreakdown } from "../components/TokenBreakdown";
import { readPublicJson } from "../lib/read-public-json";
import type { TokenData } from "../lib/types";

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
      minHeight: "90vh",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 32,
      padding: "80px 24px",
    }}>
      <div className="animate-fade-in">
        <AnimatedCounter target={data.totals.total_tokens} duration={2000} />
        <p style={{
          marginTop: 12,
          textAlign: "center",
          fontSize: 13,
          letterSpacing: "0.02em",
          color: "var(--muted)",
          lineHeight: 1.6,
        }}>
          tokens consumed by {data.models.join(", ")}
        </p>
      </div>

      <div className="animate-fade-in-delay">
        <TokenBreakdown totals={data.totals} />
      </div>

      <DailyChart daily={data.daily} firstDate={data.firstDate} />
    </div>
  );
}
