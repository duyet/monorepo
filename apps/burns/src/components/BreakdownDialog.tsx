import { type CSSProperties, type JSX, useEffect, useState } from "react";
import { formatDay, formatMonth } from "../lib/dates";
import { fmtCompactTokens, fmtCost } from "../lib/sources";
import type { SourceTotal, TokenTotals } from "../lib/types";
import {
  byMonth,
  type Day,
  dayTotal,
  leadAgent,
  type Series,
  seriesIndex,
  topDays,
} from "../lib/usage";
import { BurnsDialog } from "./BurnsDialog";
import { SourceIcon } from "./SourceIcons";
import { TextTabs } from "./TextTabs";

const PANES = [
  { key: "agents", label: "Agents" },
  { key: "months", label: "Months" },
  { key: "days", label: "Top days" },
  { key: "mix", label: "Tokens" },
] as const;

type Pane = (typeof PANES)[number]["key"];

const TOP_DAYS = 15;

const MIX = [
  { label: "Cache read", key: "cache_read_tokens", color: "var(--claude)" },
  { label: "Cache write", key: "cache_creation_tokens", color: "var(--open)" },
  { label: "Input", key: "input_tokens", color: "var(--up)" },
  { label: "Output", key: "output_tokens", color: "var(--fg)" },
] as const;

interface BreakdownDialogProps {
  /** All-time per agent, largest first. */
  sourceTotals: readonly SourceTotal[];
  totals: TokenTotals;
  /** Every day, oldest first. */
  days: readonly Day[];
  series: readonly Series[];
}

/** Track fill that grows from 0 once mounted, so each tab plays its entrance. */
function Fill({
  pct,
  color,
  index,
}: {
  pct: number;
  color: string;
  index: number;
}) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setWidth(pct));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [pct]);
  return (
    <i
      style={
        {
          "--c": color,
          width: `${width}%`,
          transitionDelay: `${Math.min(index, 20) * 20}ms`,
        } as CSSProperties
      }
    />
  );
}

interface RowProps {
  label: string;
  icon?: string;
  tokens: number;
  cost: number;
  max: number;
  color: string;
  index: number;
}

function Row({ label, icon, tokens, cost, max, color, index }: RowProps) {
  return (
    <div className="burns-row">
      <div className="burns-row-name">
        <span>
          {icon && <SourceIcon name={icon} />}
          {label}
        </span>
        <span className="burns-track">
          <Fill
            pct={max > 0 ? (tokens / max) * 100 : 0}
            color={color}
            index={index}
          />
        </span>
      </div>
      <span className="burns-row-v">{fmtCompactTokens(tokens)}</span>
      <span className="burns-row-c">{fmtCost(cost)}</span>
    </div>
  );
}

export function BreakdownDialog({
  sourceTotals,
  totals,
  days,
  series,
}: BreakdownDialogProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const [pane, setPane] = useState<Pane>("agents");
  // Bumped on every open so the bars play their entrance again.
  const [session, setSession] = useState(0);

  const colorOf = (agent: string) => series[seriesIndex(series, agent)].color;

  const months = byMonth(days)
    .reverse()
    .map((m) => ({ date: m.date, ...dayTotal(m) }));
  const monthMax = Math.max(0, ...months.map((m) => m.tokens));
  const busiest = topDays(days, TOP_DAYS);

  return (
    <>
      <button
        type="button"
        className="burns-text-btn"
        onClick={() => {
          setSession((n) => n + 1);
          setOpen(true);
        }}
      >
        Breakdown
      </button>
      <BurnsDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Breakdown"
        tabs={
          <TextTabs<Pane>
            label="Breakdown"
            options={PANES}
            value={pane}
            onChange={setPane}
          />
        }
      >
        <div className="burns-pane" key={`${pane}:${session}`}>
          {pane === "agents" && (
            <div className="burns-rows">
              {sourceTotals.map((s, i) => (
                <Row
                  key={s.source}
                  label={s.source}
                  icon={s.source}
                  tokens={s.total_tokens}
                  cost={s.cost}
                  max={sourceTotals[0]?.total_tokens ?? 0}
                  color={colorOf(s.source)}
                  index={i}
                />
              ))}
            </div>
          )}
          {pane === "months" && (
            <div className="burns-rows">
              {months.map((m, i) => (
                <Row
                  key={m.date}
                  label={formatMonth(m.date)}
                  tokens={m.tokens}
                  cost={m.cost}
                  max={monthMax}
                  color="var(--s0)"
                  index={i}
                />
              ))}
            </div>
          )}
          {pane === "days" && (
            <div className="burns-rows">
              {busiest.map((d, i) => {
                const lead = leadAgent(d);
                const { tokens, cost } = dayTotal(d);
                return (
                  <Row
                    key={d.date}
                    label={formatDay(d.date, true)}
                    icon={lead ?? undefined}
                    tokens={tokens}
                    cost={cost}
                    max={dayTotal(busiest[0]).tokens}
                    color={lead ? colorOf(lead) : "var(--other)"}
                    index={i}
                  />
                );
              })}
            </div>
          )}
          {pane === "mix" && (
            <>
              <div className="burns-mixbar" aria-hidden="true">
                {MIX.map((m) => (
                  <i
                    key={m.key}
                    title={m.label}
                    style={{
                      background: m.color,
                      flex: `${totals[m.key] / totals.total_tokens} 0 2px`,
                    }}
                  />
                ))}
              </div>
              <div className="burns-mixleg">
                {MIX.map((m) => (
                  <div key={m.key}>
                    <span>
                      <b style={{ background: m.color }} />
                      {m.label}
                    </span>
                    <span>
                      {fmtCompactTokens(totals[m.key])} ·{" "}
                      {((totals[m.key] / totals.total_tokens) * 100).toFixed(1)}
                      %
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </BurnsDialog>
    </>
  );
}
