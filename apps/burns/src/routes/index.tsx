import ThemeToggle from "@duyet/components/ThemeToggle";
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
      padding: "24px",
      boxSizing: "border-box",
      overflow: "hidden",
    }}>
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
      }}>
        <div className="animate-fade-in">
          <AnimatedCounter target={data.totals.total_tokens} />
          <div style={{
            marginTop: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            fontSize: 11,
            letterSpacing: "0.04em",
            color: "var(--muted)",
            flexWrap: "wrap",
            lineHeight: 1.4,
          }}>
            <span>tokens consumed by</span>
            <SourceIcons sources={data.sources} />
          </div>
        </div>

        <div className="animate-fade-in-delay">
          <TokenBreakdown totals={data.totals} />
        </div>

        <DailyChart daily={data.daily} firstDate={data.firstDate} lastDate={data.lastDate} />
      </div>

      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        maxWidth: 400,
        paddingTop: 8,
        borderTop: "1px solid var(--hairline)",
      }}>
        <ThemeToggle />
        <a
          href="https://duyet.net"
          style={{
            fontSize: 11,
            letterSpacing: "0.04em",
            color: "var(--muted-soft)",
            textDecoration: "none",
          }}
        >
          duyet.net
        </a>
      </div>
    </div>
  );
}
