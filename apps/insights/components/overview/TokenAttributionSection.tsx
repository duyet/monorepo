import { Eyebrow } from "@duyet/components";
import type { LoaderData } from "./types";
import { InsightAreaChart, InsightStackedBarChart } from "./charts";
import { shortDate, formatNumber, formatCompact } from "./helpers";

function TokenAttributionSection({ data }: { data: LoaderData }) {
  const efficiency = [...data.ccEfficiency].reverse().map((d) => ({
    date: shortDate(d.date),
    score: d["Efficiency Score"],
  }));

  const byModel = data.ccByModel.map((d) => ({
    ...d,
    date: shortDate(String(d.date)),
  }));

  const projects = data.ccProjects.slice(0, 6).map((project) => ({
    label: project.projectName,
    meta: `${formatNumber(project.relativeUsage)}% share`,
    value: formatCompact(project.tokens),
  }));

  return (
    <>
      {/* Stacked bar chart: daily tokens by model */}
      <div className="rd-g2 mt-3">
        <div className="rd-card p-[clamp(18px,2.2vw,26px)] p-[clamp(22px,2.6vw,30px)]">
          <div className="mb-5">
            <Eyebrow>AI · ccusage</Eyebrow>
            <h3
              className="text-[1.35rem] mt-[10px] tracking-[-0.03em]"
            >
              Where the tokens went
            </h3>
            <p className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-xs mt-1">
              Daily token volume by model (thousands), last 30 days.
            </p>
          </div>
          <InsightStackedBarChart data={byModel} />
        </div>

        <div className="rd-card p-[clamp(18px,2.2vw,26px)] p-[clamp(22px,2.6vw,30px)]">
          <div className="mb-5">
            <Eyebrow>Efficiency · ccusage</Eyebrow>
            <h3
              className="text-[1.35rem] mt-[10px] tracking-[-0.03em]"
            >
              Tokens per dollar
            </h3>
            <p className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-xs mt-1">
              Cost efficiency trend — higher is cheaper output.
            </p>
          </div>
          <InsightAreaChart
            data={efficiency}
            keys={["score"]}
            labelMap={{ score: "Tokens/$" }}
            accentKey="score"
          />
        </div>
      </div>

      {/* Top sessions by tokens */}
      {projects.length > 0 && (
        <div
          className="rd-card p-[clamp(18px,2.2vw,26px)] mt-3 p-[clamp(22px,2.6vw,30px)]"
        >
          <div className="mb-2">
            <Eyebrow>Projects · ccusage</Eyebrow>
            <h3
              className="text-[1.35rem] mt-[10px] tracking-[-0.03em]"
            >
              Top sessions by tokens
            </h3>
          </div>
          <div className="rd-rows">
            {projects.map((item) => (
              <div
                key={item.label}
                className="rd-row grid-cols-[1fr_auto] gap-[18px] items-center"
              >
                <div className="min-w-0">
                  <span
                    className="font-[var(--font-mono)] text-[13.5px] block truncate"
                  >
                    {item.label}
                  </span>
                  <span
                    className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-xs"
                  >
                    {item.meta}
                  </span>
                </div>
                <span className="font-[var(--font-mono)] text-sm font-semibold">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export { TokenAttributionSection };
